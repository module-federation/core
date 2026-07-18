import express from 'express';
import path from 'node:path';

const [distDir, portValue] = process.argv.slice(2);
const port = Number(portValue);

if (!distDir || !Number.isInteger(port)) {
  throw new Error('Usage: serveDist.mjs <dist-dir> <port>');
}

const app = express();
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.static(path.resolve(distDir)));
app.listen(port, process.env.HOST ?? 'localhost', () => {
  console.log(`[bridge-ssr-static] serving ${distDir} on port ${port}`);
});
