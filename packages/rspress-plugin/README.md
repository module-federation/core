# @module-federation/rspress-plugin

Module Federation integration for Rspress.

## Transform remote code blocks

Enable the capability on the Rspress producer:

```ts
pluginModuleFederation(mfConfig, {
  transformCodeBlocks: true,
});
```

The producer keeps authoring regular Markdown. It does not need to add an id or
create a code-block component:

````md
## View all commands

```bash
npx mf -h
```
````

The consumer creates a transformer with the browser-safe runtime entry and
passes it to the remote MDX document:

```tsx
import Cli from 'mf-doc/cli-en';
import { transformCodeBlock } from '@module-federation/rspress-plugin/runtime';

export const replaceCliName = transformCodeBlock({
  replace: [[/\bmf\b/g, 'vmok']],
  filter: ({ lang }) => lang === 'bash' || lang === 'text',
});

export default function Page() {
  return <Cli name="Vmok" cmd="vmok" transformCodeBlock={replaceCliName} />;
}
```

Replacement rules run in order. Without `filter`, they are considered for every
fenced code block in the remote document; blocks with no matching content keep
their original highlighting. A transformer can also return a different
language when the replacement changes the code type.

The transformation runs while rendering the remote MDX document, so the same
result is used by browser rendering and SSG. Existing HTML-based llms/Markdown
rebuilds also read the transformed output.
