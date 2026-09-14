import { createHash } from 'node:crypto';
import path from 'node:path';
import type {
  FederatedMcpContribution,
  FederatedSkillFile,
  FederatedTool,
  SkillFrontmatter,
} from './contracts.ts';

export interface SkillResourceEntry {
  uri: string;
  digest: string;
  size: number;
}

export interface SkillEntry {
  uri: string;
  frontmatter: SkillFrontmatter;
  resources: SkillResourceEntry[];
}

export interface CatalogResource extends FederatedSkillFile {
  name: string;
  uri: string;
}

const digest = (text: string): string =>
  `sha256:${createHash('sha256').update(text).digest('hex')}`;

const resourceUri = (skillPath: string, filePath: string): string =>
  `skill://${skillPath}/${filePath}`;

export class FederatedSkillsCatalog {
  readonly skills: SkillEntry[];
  readonly resources: CatalogResource[];
  readonly tools: FederatedTool[];

  readonly #skillsByUri: Map<string, SkillEntry>;
  readonly #resourcesByUri: Map<string, CatalogResource>;

  constructor(contributions: FederatedMcpContribution[]) {
    const skillsByUri = new Map<string, SkillEntry>();
    const resourcesByUri = new Map<string, CatalogResource>();
    const toolsByName = new Map<string, FederatedTool>();

    for (const contribution of contributions) {
      for (const skill of contribution.skills) {
        const skillUri = resourceUri(skill.path, 'SKILL.md');
        if (!skill.files['SKILL.md']) {
          throw new Error(`${skillUri} has no SKILL.md`);
        }
        if (skillsByUri.has(skillUri)) {
          throw new Error(`Duplicate skill URI: ${skillUri}`);
        }

        const resources = Object.entries(skill.files)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([filePath, file]) => {
            const uri = resourceUri(skill.path, filePath);
            if (resourcesByUri.has(uri)) {
              throw new Error(`Duplicate skill resource URI: ${uri}`);
            }
            resourcesByUri.set(uri, {
              ...file,
              name: path.basename(filePath),
              uri,
            });
            return {
              uri,
              digest: digest(file.text),
              size: Buffer.byteLength(file.text),
            };
          });

        skillsByUri.set(skillUri, {
          uri: skillUri,
          frontmatter: skill.frontmatter,
          resources,
        });
      }

      for (const tool of contribution.tools) {
        if (toolsByName.has(tool.name)) {
          throw new Error(`Duplicate federated tool: ${tool.name}`);
        }
        toolsByName.set(tool.name, tool);
      }
    }

    this.#skillsByUri = skillsByUri;
    this.#resourcesByUri = resourcesByUri;
    this.skills = [...skillsByUri.values()];
    this.resources = [...resourcesByUri.values()];
    this.tools = [...toolsByName.values()];
  }

  getSkill(uri: string): SkillEntry | undefined {
    return this.#skillsByUri.get(uri);
  }

  getResource(uri: string): CatalogResource | undefined {
    return this.#resourcesByUri.get(uri);
  }
}
