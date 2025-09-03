#!/usr/bin/env node

/**
 * Intelligent Prompt Improvement/Optimizer Hook
 *
 * This hook uses Claude Code in non-interactive mode to intelligently analyze
 * and enhance user prompts with:
 * - Deep intent analysis and exploration
 * - Context-aware technical understanding
 * - Comprehensive requirement clarification
 * - Domain-specific improvements for software engineering
 * - Module federation and webpack-specific enhancements
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Call Claude Code in non-interactive mode to analyze and improve a prompt
 */
async function callClaudeForPromptImprovement(originalPrompt, context) {
  return new Promise((resolve, reject) => {
    const analysisPrompt = `
You are a prompt optimization expert with deep understanding of software engineering and user psychology. Your task is to transform the user's prompt into a comprehensive, well-structured request that will yield the best possible response.

**DEEP INTENT ANALYSIS**: First, analyze what the user REALLY wants to achieve:
- What is their underlying goal beyond the surface request?
- What problems are they trying to solve?
- What context or constraints might they be working within?
- What level of expertise do they likely have?
- What unstated assumptions or needs might they have?

**Original User Prompt**: "${originalPrompt}"

**Project Context for Enhancement**:
${JSON.stringify(context, null, 2)}

**Your Enhancement Process**:
1. **Understand User Intent Deeply**: Go beyond the literal words to understand their true needs, goals, and context
2. **Identify Knowledge Gaps**: What information would make the response significantly more helpful?
3. **Add Technical Context**: Incorporate relevant project-specific knowledge and best practices
4. **Anticipate Follow-ups**: Include considerations that prevent the need for clarification questions
5. **Structure for Clarity**: Organize the enhanced prompt in a logical, comprehensive way

**Critical Instructions**:
- Return ONLY the enhanced prompt text (no meta-commentary)
- Preserve the user's core intent while dramatically improving specificity and context
- Make it comprehensive enough that an expert can provide the most helpful response possible
- Include relevant technical considerations from the project context
- If the original prompt is already excellent, enhance it with deeper context and considerations

**Enhanced Prompt**:`;

    const claudeProcess = spawn(
      'claude',
      [
        '-p',
        analysisPrompt,
        '--output-format',
        'text',
        '--max-turns',
        '10',
        '--dangerously-skip-permissions',
      ],
      {
        cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, CLAUDE_DISABLE_HOOKS: '1' }, // Prevent recursive hook calls
      },
    );

    let output = '';
    let errorOutput = '';

    claudeProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    claudeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    claudeProcess.on('close', (code) => {
      if (code === 0) {
        // Clean up the output - remove any markdown formatting or extra text
        let improvedPrompt = output.trim();

        // Remove common Claude response patterns
        improvedPrompt = improvedPrompt
          .replace(/^Enhanced Prompt:\s*/i, '')
          .replace(/^Here's an improved version.*?:/i, '')
          .replace(/^I'll improve.*?:/i, '')
          .replace(/^The improved prompt is:\s*/i, '')
          .trim();

        resolve(improvedPrompt || originalPrompt);
      } else {
        console.error(
          `Claude process failed with code ${code}: ${errorOutput}`,
        );
        resolve(originalPrompt); // Fallback to original prompt
      }
    });

    claudeProcess.on('error', (error) => {
      console.error(`Failed to spawn Claude process: ${error.message}`);
      resolve(originalPrompt); // Fallback to original prompt
    });

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      claudeProcess.kill();
      resolve(originalPrompt);
    }, 180000); // 3 minute timeout

    claudeProcess.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Extract context from the current project structure
 */
function getProjectContext() {
  const projectDir =
    process.env.CLAUDE_PROJECT_DIR || '/Users/bytedance/dev/core';

  const context = {
    isMonorepo: false,
    hasModuleFederation: false,
    technologies: [],
    testFramework: null,
    buildSystem: null,
  };

  // Check for key files
  const keyFiles = [
    'nx.json',
    'package.json',
    'pnpm-workspace.yaml',
    'jest.config.ts',
    'webpack.config.js',
    'tsconfig.json',
  ];

  const existingFiles = keyFiles.filter((file) =>
    fs.existsSync(path.join(projectDir, file)),
  );

  // Analyze project structure
  if (
    existingFiles.includes('nx.json') &&
    existingFiles.includes('pnpm-workspace.yaml')
  ) {
    context.isMonorepo = true;
  }

  if (existingFiles.includes('package.json')) {
    try {
      const pkgPath = path.join(projectDir, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps =
        JSON.stringify(pkg.dependencies || {}) +
        JSON.stringify(pkg.devDependencies || {});
      if (deps.includes('@module-federation')) {
        context.hasModuleFederation = true;
      }
    } catch (e) {
      // Ignore errors reading package.json
    }
  }

  if (existingFiles.includes('jest.config.ts')) {
    context.testFramework = 'jest';
  }

  if (existingFiles.includes('webpack.config.js')) {
    context.buildSystem = 'webpack';
  }

  // Check for TypeScript
  if (existingFiles.includes('tsconfig.json')) {
    context.technologies.push('typescript');
  }

  return context;
}

/**
 * Main function
 */
async function main() {
  try {
    // Read input from stdin
    let inputData = '';
    process.stdin.on('data', (chunk) => {
      inputData += chunk;
    });

    process.stdin.on('end', async () => {
      try {
        const input = JSON.parse(inputData);
        const prompt = input.prompt || '';

        if (!prompt) {
          process.exit(0);
        }

        // Skip optimization for very short or simple prompts that don't need enhancement
        const wordCount = prompt.trim().split(/\s+/).length;
        if (
          wordCount <= 4 ||
          prompt.length < 10 ||
          /^(hi|hello|hey|thanks|thank you)$/i.test(prompt.trim())
        ) {
          process.exit(0);
        }

        // Get project context
        const context = getProjectContext();

        // Use Claude Code to intelligently improve the prompt
        const improvedPrompt = await callClaudeForPromptImprovement(
          prompt,
          context,
        );

        // Use the improved prompt if Claude provided a meaningful enhancement
        if (
          improvedPrompt &&
          improvedPrompt !== prompt &&
          improvedPrompt.trim().length > 0
        ) {
          const output = {
            hookSpecificOutput: {
              hookEventName: 'UserPromptSubmit',
              additionalContext: improvedPrompt,
            },
          };
          console.log(JSON.stringify(output));
        }

        process.exit(0);
      } catch (e) {
        console.error(`Error parsing JSON input: ${e.message}`);
        process.exit(1);
      }
    });
  } catch (e) {
    console.error(`Error in prompt optimizer: ${e.message}`);
    process.exit(1);
  }
}

// Handle stdin
process.stdin.setEncoding('utf8');
main();
