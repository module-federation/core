export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
}

export interface FederatedSkillFile {
  mimeType: string;
  text: string;
}

export interface FederatedSkill {
  path: string;
  frontmatter: SkillFrontmatter;
  files: Record<string, FederatedSkillFile>;
}

export interface FederatedTool {
  name: string;
  description: string;
  run: () => Promise<Record<string, unknown>>;
}

export interface FederatedMcpContribution {
  providerId: string;
  buildVersion: string;
  skills: FederatedSkill[];
  tools: FederatedTool[];
}

export interface FederatedContributionModule {
  contribution?: FederatedMcpContribution;
  default?: FederatedMcpContribution;
}
