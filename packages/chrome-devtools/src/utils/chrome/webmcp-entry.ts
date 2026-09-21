import { registerDevtoolsWebMCP } from './webmcp';

void registerDevtoolsWebMCP().catch((error) => {
  console.warn(
    '[Module Federation Devtools] WebMCP registration failed',
    error,
  );
});
