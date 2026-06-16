# website-new

This is a website built with Rspress and Webpack 5 Module Federation, serving as a playground for testing and demonstrating the capabilities of Module Federation in a real-world application.

## Scripts

- `pnpm dev`: Start dev server
- `pnpm build`: Build production bundle

## Configuration

Check `rspress.config.ts` for federation settings.

## Authoring docs: where to put reusable mdx

The docs site has two kinds of reusable mdx pieces. Pick the right bucket so links keep working under both `/en` and `/zh`.

```
docs/
  _snippets/                # shared, language-agnostic code snippets
    install-kit.mdx
    rspack/create-config.mdx
    node/*.mdx
    ...
  en/
    _components/            # English-only doc fragments
      runtime/index.mdx
      secondary-build.mdx
      ...
  zh/
    _components/            # Chinese-only doc fragments
      runtime/index.mdx
      ...
```

**Use `docs/_snippets/` when the file is:**

- A pure code/command snippet (bash output, ts/js config example)
- Reusable across languages with no prose
- Possibly parameterized via `props` (e.g. `install-kit.mdx` uses `${props.pkgName}`)

**Use `docs/<lang>/_components/` when the file contains:**

- Localized prose / explanatory text
- Cross-page markdown links like `/guide/...` — these must live under `docs/<lang>/` so rspress prefixes them with the correct locale, otherwise the zh site will jump to en pages

### Import aliases

`rspress.config.ts` provides:

- `@components` → `src/components/` — real React components (`.tsx`)
- `@docs` → `docs/` — used to import the mdx partials above

Examples:

```mdx
import Collapse from '@components/Collapse'; // tsx component
import InstallKit from '@docs/_snippets/install-kit'; // shared snippet
import Runtime from '@docs/zh/_components/runtime/index'; // zh fragment
import Runtime from '@docs/en/_components/runtime/index'; // en fragment
```

Both `_snippets/` and `_components/` are excluded from routing by rspress's default `excludeConvention` (`**/_[^_]*`), so they never produce a public page.
