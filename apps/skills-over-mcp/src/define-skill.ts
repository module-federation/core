import type {
  FederatedSkill,
  FederatedSkillFile,
  SkillFrontmatter,
} from './contracts.ts';

interface SkillDefinition extends SkillFrontmatter {
  body: string;
  path: string;
  supportingFiles?: Record<string, FederatedSkillFile>;
}

const quoteYaml = (value: string): string => JSON.stringify(value);

export const defineSkill = ({
  body,
  path,
  supportingFiles = {},
  ...frontmatter
}: SkillDefinition): FederatedSkill => {
  const pathName = path.split('/').at(-1);
  if (pathName !== frontmatter.name) {
    throw new Error(
      `Skill path must end in its name: ${path} != ${frontmatter.name}`,
    );
  }

  const license = frontmatter.license
    ? `license: ${quoteYaml(frontmatter.license)}\n`
    : '';
  const skillMarkdown = `---\nname: ${quoteYaml(frontmatter.name)}\ndescription: ${quoteYaml(frontmatter.description)}\n${license}---\n\n${body.trim()}\n`;

  return {
    path,
    frontmatter,
    files: {
      'SKILL.md': {
        mimeType: 'text/markdown',
        text: skillMarkdown,
      },
      ...supportingFiles,
    },
  };
};
