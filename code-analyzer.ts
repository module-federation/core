import OpenAI from 'openai'; // Import OpenAI client for DeepSeek
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { Minimatch } from 'minimatch'; // Fix: use correct export name

interface RefactorCandidate {
  description: string;
  locations: Array<{
    file: string;
    startLine: number;
    endLine: number;
  }>;
  suggestion: string; // Suggestion for shared function/utility
}

// Structure expected from DeepSeek's JSON output
interface DeepSeekCandidate {
  description: string;
  locations: Array<{ file: string; startLine: number; endLine: number }>;
  suggestion: string;
}

interface DeepSeekResponse {
  refactorCandidates: DeepSeekCandidate[];
}

interface DirectorySuggestion {
  directoryA: string;
  directoryB: string;
  description: string; // Description of the relationship/overlap
  suggestion: string; // High-level suggestion (e.g., shared module)
}

interface CodeAnalysisResult {
  files: string[];
  refactorCandidates: RefactorCandidate[];
  directorySuggestions: DirectorySuggestion[]; // Add field for directory results
  summary: string;
}

interface AnalyzerConfig {
  rootDir: string;
  filePatterns: string[];
  excludePatterns?: string[];
  deepseekApiKey: string; // Add DeepSeek API key
  batchSize?: number; // Note: batchSize is not currently used in the loop logic
  minDuplicateLines?: number;
}

const DEFAULT_CONFIG: Partial<AnalyzerConfig> = {
  minDuplicateLines: 3, // Minimum lines to consider as duplicate
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
};

// Helper to safely parse JSON, returning null on error
function safeJsonParse<T>(jsonString: string): T | null {
  try {
    // Clean the JSON string: remove trailing commas which might cause errors
    let cleanedJson = jsonString.replace(/,(?=\s*})/g, '');
    cleanedJson = cleanedJson.replace(/,(?=\s*])/g, '');
    // Attempt to extract JSON from potential markdown code block
    const jsonMatch =
      cleanedJson.match(/```json\n([\s\S]*?)\n```/) ||
      cleanedJson.match(/{[\s\S]*}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[1] || jsonMatch[0];
    }
    return JSON.parse(cleanedJson) as T;
  } catch (error) {
    console.warn('Failed to parse JSON string:', error);
    console.warn('Original JSON string:', jsonString);
    return null;
  }
}

// Helper function for managing concurrent tasks
async function processPool<T, R>(
  items: T[],
  processItem: (item: T, index: number) => Promise<R>,
  concurrencyLimit: number,
): Promise<R[]> {
  const results: R[] = [];
  const activePromises = new Set<Promise<void>>();
  let currentIndex = 0;
  let processedCount = 0;
  const totalItems = items.length;

  const processNext = async (): Promise<void> => {
    while (currentIndex < totalItems) {
      if (activePromises.size >= concurrencyLimit) {
        // Wait for any promise to complete before adding a new one
        await Promise.race(activePromises);
      }

      const itemIndex = currentIndex++;
      const item = items[itemIndex];

      console.log(`Starting task ${itemIndex + 1}/${totalItems}...`);

      const promise = (async () => {
        try {
          const result = await processItem(item, itemIndex);
          results[itemIndex] = result; // Store result in original order
          processedCount++;
          console.log(
            `Finished task ${itemIndex + 1}/${totalItems}. Total processed: ${processedCount}/${totalItems}.`,
          );
        } catch (error) {
          console.error(`Error processing task ${itemIndex + 1}:`, error);
          // Decide how to handle errors, e.g., push a default/error value or skip
          // results[itemIndex] = null; // Example: Storing null on error
          processedCount++; // Still increment processed count even on error
          console.log(
            `Finished task ${itemIndex + 1}/${totalItems} with error. Total processed: ${processedCount}/${totalItems}.`,
          );
        }
      })();

      const promiseWithCleanup = promise.finally(() => {
        activePromises.delete(promiseWithCleanup);
        // Immediately try to queue the next task if the pool has space
        // No need for explicit trigger, the loop handles it
      });

      activePromises.add(promiseWithCleanup);
    }

    // After all items are queued, wait for all active promises to complete
    await Promise.allSettled(activePromises);
  };

  await processNext();
  // Filter out potential empty slots if errors weren't stored
  return results.filter((r) => r !== undefined);
}

export async function analyzeCodebase(
  config: AnalyzerConfig,
): Promise<CodeAnalysisResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize DeepSeek Client
  const deepseekClient = new OpenAI({
    apiKey: finalConfig.deepseekApiKey,
    baseURL: 'https://api.deepseek.com',
  });

  // Find files
  const excludePatterns = [
    ...(finalConfig.excludePatterns || []),
    '**/types.ts',
    '**/type/**',
    '**/types/**',
  ];
  const files = await glob(finalConfig.filePatterns, {
    cwd: finalConfig.rootDir,
    ignore: excludePatterns,
    absolute: true,
  });

  console.log(`Found ${files.length} files to analyze (after exclusions)`);

  // --- Generate all unique file pairs upfront ---
  const filePairs: Array<{ file1: string; file2: string }> = [];
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      filePairs.push({ file1: files[i], file2: files[j] });
    }
  }
  console.log(`Generated ${filePairs.length} unique file pairs to compare.`);

  const allRefactorCandidates: RefactorCandidate[] = [];
  const concurrencyLimit = 70;
  // let processedCount = 0; // Now handled within processPool

  // --- Process file pairs using the pool ---
  console.log('\nStarting File Pair Analysis with Concurrency Pool...');
  const filePairResults = await processPool(
    filePairs,
    async (pair, index) => {
      let file1 = pair.file1;
      let file2 = pair.file2;
      if (file1 > file2) {
        [file1, file2] = [file2, file1]; // Swap to ensure consistent order
      }

      const relativeFile1 = path.relative(finalConfig.rootDir, file1);
      const relativeFile2 = path.relative(finalConfig.rootDir, file2);
      let candidatesInPair: RefactorCandidate[] = [];

      try {
        // Read files for the pair
        let content1: string | null = null;
        let content2: string | null = null;
        try {
          content1 = fs.readFileSync(file1, 'utf-8');
          content2 = fs.readFileSync(file2, 'utf-8');
        } catch (readError) {
          console.error(
            `  Error reading files ${relativeFile1} or ${relativeFile2} for task ${index + 1}:`,
            readError,
          );
          return []; // Return empty array for this pair on read error
        }

        // DeepSeek Analysis
        console.log(
          `  -> Analyzing pair: ${relativeFile1} and ${relativeFile2} (Task ${index + 1})`,
        );
        try {
          const deepseekSystemPrompt = `You are a code analysis assistant. Analyze the two provided code files to identify opportunities to *share code* by refactoring duplicated or similar logic into a single shared function or pattern. Focus ONLY on finding blocks of code (at least ${finalConfig.minDuplicateLines} lines long) that are identical or near-identical across both files and represent a specific piece of logic that could be shared. Provide the exact locations (file path relative to project root, start/end lines) and a suggestion for a shared function/utility. Respond strictly in JSON format using the structure: {\"refactorCandidates\": [{\"description\": \"...\", \"locations\": [{\"file\": \"path/to/file1\", \"startLine\": num, \"endLine\": num}, {\"file\": \"path/to/file2\", \"startLine\": num, \"endLine\": num}], \"suggestion\": \"...\"}]}. If no clear opportunities exist, return an empty \"refactorCandidates\" array. IMPORTANT: Ensure the output is valid JSON.\n\nConsider the potential impact on final bundle size after minification and compression. While reducing duplication improves maintainability, extracting very small, simple, or frequently inlined code blocks might sometimes lead to a slight size *increase* due to abstraction overhead. Prioritize suggestions that offer clear benefits in terms of both logic simplification and potential size reduction, especially for non-trivial code blocks.`;
          const deepseekUserPrompt = `File 1 (${relativeFile1}):\n\`\`\`\n${content1}\n\`\`\`\n\nFile 2 (${relativeFile2}):\n\`\`\`\n${content2}\n\`\`\``;

          const deepseekResponse = await deepseekClient.chat.completions.create(
            {
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: deepseekSystemPrompt },
                { role: 'user', content: deepseekUserPrompt },
              ],
              response_format: { type: 'json_object' },
              max_tokens: 6000,
              temperature: 0.1,
            },
          );

          const responseContent = deepseekResponse.choices[0]?.message?.content;
          if (responseContent) {
            const parsed = safeJsonParse<DeepSeekResponse>(responseContent);
            if (
              parsed &&
              parsed.refactorCandidates &&
              Array.isArray(parsed.refactorCandidates)
            ) {
              candidatesInPair = parsed.refactorCandidates.map((c) => ({
                ...c,
                locations: c.locations.map((l) => ({
                  ...l,
                  file: path.relative(
                    finalConfig.rootDir,
                    path.resolve(finalConfig.rootDir, l.file),
                  ),
                })),
              }));
              console.log(
                `     DeepSeek found ${candidatesInPair.length} candidate(s) for ${relativeFile1} & ${relativeFile2} (Task ${index + 1}).`,
              );
            } else {
              console.log(
                `     DeepSeek response for ${relativeFile1} & ${relativeFile2} (Task ${index + 1}) could not be parsed or was empty.`,
              );
            }
          } else {
            console.log(
              `     DeepSeek returned empty response for ${relativeFile1} & ${relativeFile2} (Task ${index + 1}).`,
            );
          }
        } catch (error) {
          console.error(
            `     Error during DeepSeek analysis for ${relativeFile1} and ${relativeFile2} (Task ${index + 1}):`,
            error,
          );
        }
      } catch (pairError) {
        console.error(
          `  Unexpected error processing pair ${relativeFile1} and ${relativeFile2} (Task ${index + 1}):`,
          pairError,
        );
      }
      return candidatesInPair;
    },
    concurrencyLimit,
  );

  // Aggregate results from the file pair pool
  filePairResults.forEach((candidates) => {
    if (candidates && candidates.length > 0) {
      allRefactorCandidates.push(...candidates);
    }
  });
  console.log(
    `File Pair Analysis complete. Found ${allRefactorCandidates.length} total candidates.`,
  );

  // Final result object (initial setup)
  const result: CodeAnalysisResult = {
    files,
    refactorCandidates: allRefactorCandidates,
    directorySuggestions: [], // Placeholder for directory suggestions
    summary: '', // Summary will be generated below
  };

  // --- Directory Level Analysis ---
  console.log('\nStarting Directory Level Analysis...');
  const allDirectorySuggestions: DirectorySuggestion[] = [];
  let directories: string[] = [];
  try {
    directories = fs
      .readdirSync(finalConfig.rootDir, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() &&
          !finalConfig.excludePatterns?.some((pattern) =>
            new Minimatch(pattern).match(path.join(finalConfig.rootDir, dirent.name)),
          ),
      )
      .map((dirent) => path.join(finalConfig.rootDir, dirent.name));
    // Optionally filter further, e.g., exclude node_modules, dist etc.
    // directories = directories.filter(dir => !dir.includes('node_modules') && !dir.includes('dist'));
    console.log(`Found ${directories.length} relevant directories to compare.`);
  } catch (err) {
    console.error('Error listing directories:', err);
  }

  const directoryPairs: Array<{ dir1: string; dir2: string }> = [];
  for (let i = 0; i < directories.length; i++) {
    for (let j = i + 1; j < directories.length; j++) {
      directoryPairs.push({ dir1: directories[i], dir2: directories[j] });
    }
  }
  console.log(`Generated ${directoryPairs.length} directory pairs.`);
  // let processedDirCount = 0; // Now handled within processPool

  // --- Process directory pairs using the pool ---
  console.log('\nStarting Directory Pair Analysis with Concurrency Pool...');
  const directoryPairResults = await processPool(
    directoryPairs,
    async (pair, index) => {
      let dir1 = pair.dir1;
      let dir2 = pair.dir2;
      if (dir1 > dir2) {
        [dir1, dir2] = [dir2, dir1];
      } // Consistent ordering

      const relativeDir1 = path.relative(finalConfig.rootDir, dir1);
      const relativeDir2 = path.relative(finalConfig.rootDir, dir2);
      let suggestionForPair: DirectorySuggestion | null = null;

      try {
        const filesDir1 = await glob('**/*', {
          cwd: dir1,
          nodir: true,
          ignore: finalConfig.excludePatterns,
        });
        const filesDir2 = await glob('**/*', {
          cwd: dir2,
          nodir: true,
          ignore: finalConfig.excludePatterns,
        });

        if (filesDir1.length === 0 || filesDir2.length === 0) {
          console.log(
            `  -> Skipping pair: ${relativeDir1} and ${relativeDir2} (Task ${index + 1}, one is empty or excluded)`,
          );
          return null; // Skip processing
        }

        // Read all file contents from both directories
        const dir1Contents = await Promise.all(
          filesDir1.map(async (file) => {
            try {
              const fullPath = path.join(dir1, file);
              return fs.readFileSync(fullPath, 'utf-8');
            } catch (err) {
              console.error(`Error reading file ${file} in ${dir1}:`, err);
              return '';
            }
          })
        );

        const dir2Contents = await Promise.all(
          filesDir2.map(async (file) => {
            try {
              const fullPath = path.join(dir2, file);
              return fs.readFileSync(fullPath, 'utf-8');
            } catch (err) {
              console.error(`Error reading file ${file} in ${dir2}:`, err);
              return '';
            }
          })
        );

        // Combine all contents from each directory
        const combinedDir1 = dir1Contents.join('\n\n');
        const combinedDir2 = dir2Contents.join('\n\n');

        console.log(
          `  -> Analyzing directory pair contents: ${relativeDir1} and ${relativeDir2} (Task ${index + 1})`,
        );

        const systemPrompt = `You are a code size optimization expert. Analyze the combined code contents from two directories to identify opportunities to reduce the overall code footprint without changing functionality. Focus on:
1. Repeated code patterns that could be written more concisely
2. Common syntax patterns that could be simplified
3. Opportunities to use more concise language features or conventions
4. Similar code structures that could be expressed more efficiently
5. Redundant or verbose patterns that could be shortened

Do NOT suggest:
- Moving code to shared locations
- Creating new utility functions
- Restructuring the codebase
- Changes that would affect functionality

Focus ONLY on ways to express the same logic in fewer bytes while maintaining identical behavior.

Respond strictly in JSON format: {"description": "Detailed observation about code patterns that could be more concise", "suggestion": "Specific suggestions for reducing code size with exact examples of before/after, focusing only on size reduction while maintaining functionality"}.
If no significant size reduction opportunities exist, respond with {"description": "No significant size reduction opportunities found.", "suggestion": "None"}.`;

        const userPrompt = `Directory 1 (${relativeDir1}) combined contents:
\`\`\`
${combinedDir1.slice(0, 15000)} ${combinedDir1.length > 15000 ? '... (truncated)' : ''}
\`\`\`

Directory 2 (${relativeDir2}) combined contents:
\`\`\`
${combinedDir2.slice(0, 15000)} ${combinedDir2.length > 15000 ? '... (truncated)' : ''}
\`\`\`

Analyze these codebases for opportunities to reduce code size while maintaining identical functionality. Focus on identifying repeated patterns, verbose syntax, or similar structures that could be written more concisely without changing behavior or moving code.`;

        const response = await deepseekClient.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1024,
          temperature: 0.4,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = safeJsonParse<{
            description: string;
            suggestion: string;
          }>(content);
          if (parsed && parsed.suggestion !== 'None') {
            suggestionForPair = {
              directoryA: relativeDir1,
              directoryB: relativeDir2,
              description: parsed.description,
              suggestion: parsed.suggestion,
            };
            console.log(
              `     Suggestion found for ${relativeDir1} & ${relativeDir2} (Task ${index + 1}).`,
            );
          } else {
            console.log(
              `     No suggestion for ${relativeDir1} & ${relativeDir2} (Task ${index + 1}).`,
            );
          }
        } else {
          console.log(
            `     Empty response for ${relativeDir1} & ${relativeDir2} (Task ${index + 1}).`,
          );
        }
      } catch (error) {
        console.error(
          `     Error analyzing directory pair ${relativeDir1} & ${relativeDir2} (Task ${index + 1}):`,
          error,
        );
      }
      return suggestionForPair;
    },
    concurrencyLimit,
  );

  // Aggregate results from the directory pair pool
  directoryPairResults.forEach((suggestion) => {
    if (suggestion) {
      allDirectorySuggestions.push(suggestion);
    }
  });
  console.log(
    `Directory Pair Analysis complete. Found ${allDirectorySuggestions.length} total suggestions.`,
  );

  // Assign directory suggestions to the final result object
  result.directorySuggestions = allDirectorySuggestions;

  // --- Generate final summary (Based only on DeepSeek results) ---
  console.log('Generating final summary (DeepSeek results)...');
  try {
    let summaryText = `Analyzed ${files.length} files (${filePairs.length} file pairs) and ${directories.length} directories (${directoryPairs.length} directory pairs) using DeepSeek concurrently.\n`;

    if (result.refactorCandidates.length > 0) {
      const candidateSummary = result.refactorCandidates
        .map(
          (c, i) =>
            `Candidate ${i + 1}: ${c.description} (shared between ${c.locations.map((l) => l.file).join(' and ')})`,
        )
        .join('\n');
      summaryText += `Found ${result.refactorCandidates.length} potential refactoring candidates from file comparisons:\n${candidateSummary}\n\n`;
    } else {
      summaryText += `No significant refactoring candidates found from file comparisons.\n\n`;
    }

    if (result.directorySuggestions.length > 0) {
      const dirSuggestionSummary = result.directorySuggestions
        .map(
          (ds, i) =>
            `Dir Suggestion ${i + 1}: Between '${ds.directoryA}' and '${ds.directoryB}' - ${ds.suggestion}`,
        )
        .join('\n');
      summaryText += `Found ${result.directorySuggestions.length} high-level directory suggestions:\n${dirSuggestionSummary}\n\n`;
    } else {
      summaryText += `No high-level directory suggestions found.\n\n`;
    }

    summaryText += `(Note: These results are from DeepSeek only.)`;
    result.summary = summaryText;

    console.log('Summary generated.');
  } catch (error) {
    console.error('Error generating summary:', error);
    result.summary = `Error generating summary. Analyzed ${files.length} files and ${directories.length} directories. Found ${result.refactorCandidates.length} file candidates and ${result.directorySuggestions.length} directory suggestions.`;
  }

  return result;
}

// generateReport function updated to include directory suggestions
export function generateReport(
  result: CodeAnalysisResult,
  format: 'markdown' | 'json' = 'markdown',
): string {
  if (format === 'json') {
    // Make file paths relative to current working directory for JSON output if not already
    const resultForJson = {
      ...result,
      refactorCandidates: result.refactorCandidates.map((candidate) => ({
        ...candidate,
        locations: candidate.locations.map((loc) => ({
          ...loc,
          file: path.relative(
            process.cwd(),
            path.resolve(process.cwd(), loc.file),
          ), // Ensure relative to cwd
        })),
      })),
      directorySuggestions: result.directorySuggestions, // Already has relative paths
    };
    return JSON.stringify(resultForJson, null, 2);
  }

  let report = '# Code Refactoring Analysis Report (DeepSeek Only)\n\n'; // Updated Title

  report += `Analyzed ${result.files.length} files and ${result.directorySuggestions.length > 0 ? result.directorySuggestions.reduce((acc, curr) => acc.add(curr.directoryA).add(curr.directoryB), new Set()).size : 'some'} directories.\n\n`;
  report += '## Summary\n\n';
  report += result.summary + '\n\n';

  report += '## Refactor Candidates (File Pairs)\n\n';
  if (result.refactorCandidates.length === 0) {
    report +=
      'No significant refactoring candidates found between file pairs.\n';
  } else {
    result.refactorCandidates.forEach((candidate, index) => {
      report += `### File Candidate ${index + 1}\n\n`; // Renamed for clarity
      report += `**Description:** ${candidate.description}\n\n`;
      report += '**Locations:**\n';
      candidate.locations.forEach((loc) => {
        const relativePath = path.relative(
          process.cwd(),
          path.resolve(process.cwd(), loc.file),
        );
        report += `- ${relativePath} (lines ${loc.startLine}-${loc.endLine})\n`;
      });
      report += `\n**Suggestion:** ${candidate.suggestion}\n\n`;
      report += '---\n\n';
    });
  }

  // --- Add Directory Suggestions Section ---
  report += '## High-Level Directory Suggestions\n\n';
  if (
    !result.directorySuggestions ||
    result.directorySuggestions.length === 0
  ) {
    report += 'No high-level suggestions found between directories.\n';
  } else {
    result.directorySuggestions.forEach((ds, index) => {
      report += `### Directory Suggestion ${index + 1}\n\n`;
      report += `**Directories:** \`${ds.directoryA}\` and \`${ds.directoryB}\`\n\n`;
      report += `**Description:** ${ds.description}\n\n`;
      report += `**Suggestion:** ${ds.suggestion}\n\n`;
      report += '---\n\n';
    });
  }

  return report;
}
