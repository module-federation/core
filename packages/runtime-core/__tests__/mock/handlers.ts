import { rest } from 'msw';
import fs from 'fs';
import path from 'path';
import { requestList } from './env';

// Define handlers that catch the corresponding requests and returns the mock data.
const mainMainifestUrl =
  'http://localhost:1111/resources/main/federation-manifest.json';

export const handlers = [
  rest.get(mainMainifestUrl, (req, res, ctx) => {
    requestList.set(
      mainMainifestUrl,
      (requestList.get(mainMainifestUrl) || 0) + 1,
    );
    const manifestJson = fs.readFileSync(
      path.resolve(__dirname, '../resources/main/federation-manifest.json'),
      'utf-8',
    );
    return res(ctx.status(200), ctx.json(JSON.parse(manifestJson)));
  }),
  rest.get(
    'http://localhost:1111/resources/:category/:app/:file',
    (req, res, ctx) => {
      const category = req.params.category;
      const app = req.params.app;
      const file = req.params.file;
      const filepath = path.resolve(
        __dirname,
        `../resources/${category}/${app}/${file}`,
      );

      const content = fs.readFileSync(filepath, 'utf-8');
      if (typeof file === 'string' && file.includes('json')) {
        return res(ctx.status(200), ctx.json(JSON.parse(content)));
      } else {
        return res(ctx.status(200), ctx.text(content));
      }
    },
  ),
];
