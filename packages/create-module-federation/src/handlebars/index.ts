import { FS_RESOURCE } from '../materials';
import { renderString, outputFs } from './utils';

import type { FsMaterial, FsResource } from '../materials';

type TargetFunction = (globMatch: string) => string;

type RenderTemplateDirOptions = {
  nodir?: boolean;
  dot?: boolean;
  ignore?: string | readonly string[];
  parameters?: Record<string, string>;
};

export { renderString };

export class HandlebarsAPI {
  async renderTemplate(
    templateResource: FsResource,
    target: string,
    outputFilePath: string,
    parameters: Record<string, string> = {},
  ) {
    if (templateResource._type !== FS_RESOURCE) {
      throw new Error('resource not match');
    }
    const resourceValue = await templateResource.value();
    if (typeof resourceValue.content !== 'string') {
      throw new Error(
        `resource.value is not string, resourceValue=${
          resourceValue as unknown as string
        }`,
      );
    }
    await outputFs(
      target,
      templateResource.resourceKey.endsWith('.handlebars')
        ? renderString(resourceValue.content, parameters)
        : resourceValue.content,
      outputFilePath,
      { encoding: 'utf-8' },
    );
  }

  async renderTemplateDir(
    material: FsMaterial,
    findGlob: string,
    target: TargetFunction,
    outputFilePath: string,
    options?: RenderTemplateDirOptions,
  ) {
    const resourceMap = await material.find(findGlob, {
      nodir: true,
      ...options,
    });
    await Promise.all(
      // resourceKey is relate path. example: in `garr-master/package.json`, package.json is resourceKey
      Object.keys(resourceMap).map(async (resourceKey) => {
        await this.renderTemplate(
          material.get(resourceKey),
          target(resourceKey),
          outputFilePath,
          options?.parameters,
        );
      }),
    );
  }
}
