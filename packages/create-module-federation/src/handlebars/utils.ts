import fs from 'fs-extra';
import path from 'path';
import handlebars from 'handlebars';

export function renderString(
  template: string,
  fullData: Record<string, unknown>,
): string {
  return handlebars.compile(template)(fullData) || '';
}

export async function outputFs(
  file: string | number,
  content: any,
  outputPath: string,
  options?: fs.WriteFileOptions | string,
) {
  const filePath = path.resolve(outputPath, file.toString());
  await fs.mkdirp(path.dirname(filePath));
  await fs.writeFile(filePath, content, options);
}
