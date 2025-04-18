import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const registerInspectTool = (mcpServer: McpServer) => {
  mcpServer.tool(
    'analyze_module_dependency',
    'Analyze module dependencies based on __FEDERATION__.moduleInfo data.',
    {
      moduleName: z.string().describe('The name of the module you want to know the information about.'),
      moduleInfo: z.any().describe('The __FEDERATION__.moduleInfo data.'),
    },
    async ({ moduleName, moduleInfo }) => {


      return {
        content: [
          {
            type: 'text',
            text: `
              moduleInfo records all module infos. The key has two types. One is the moduleName, the other is moduleName:moduleVersion.
              If the key has moduleVersion, it means the module is provider and is consumed by other consumers.
              The moduleVersion value is the same as moduleInfo[consumeModuleName].remotesInfo[providerModuleName].matchedVersion.

              Combine with the moduleName and moduleInfo data to analyze the ${moduleName} dependencies

            `,
          },
        ],
      };

      // const targetModuleKeys:string[] = [];
      // const regex = new RegExp(`^${moduleName}(:|$)`)
      // for (const key in moduleInfo) {
      //   if (regex.test(key)) {
      //     targetModuleKeys.push(key)
      //   }
      // }

      // if (!targetModuleKeys.length) {
      //   return {
      //     content: [
      //       {
      //         type: 'text',
      //         text: `Module ${moduleName} not found in moduleInfo.`,
      //       },
      //     ],
      //   };
      // }

      // let producers = [];
      // let consumers = [];
      // let version = '';

      // if ('remotesInfo' in targetModule) {
      //   producers = Object.keys(targetModule.remotesInfo);
      // }

      // // 查找消费该模块的模块
      // for (const [name, info] of Object.entries(moduleInfo)) {
      //   if (info && 'consumerList' in info && info.consumerList.includes(moduleName)) {
      //     consumers.push(name);
      //   }
      // }

      // if ('version' in targetModule) {
      //   version = targetModule.version;
      // }

      // return {
      //   content: [
      //     {
      //       type: 'text',
      //       text: `Module ${moduleName} information:\nProducers: ${producers.join(', ')}\nConsumers: ${consumers.join(', ')}\nVersion: ${version}`,
      //     },
      //   ],
      // };
    },
  );

};
