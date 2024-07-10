import { rest } from 'msw';
import fs from 'fs';
import path from 'path';

export const handlers = [
  rest.get(
    'http://localhost:1111/resources/:category/:app/:file',
    (req, res, ctx) => {
      console.log(1111, req);
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
