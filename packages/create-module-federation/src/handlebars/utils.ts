import { mkdir, writeFile } from 'fs/promises';
import type { WriteFileOptions } from 'fs';
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
  options?: WriteFileOptions | string,
) {
  const filePath = path.resolve(outputPath, file.toString());
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, options);
}
