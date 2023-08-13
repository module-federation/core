// Utility function to remove unnecessary shared keys from the default share scope
import { DEFAULT_SHARE_SCOPE } from "../../internal";

export function removeUnnecessarySharedKeys(
  shared: Record<string, unknown>
): void {
  const warnings: string[] = Object.keys(shared).reduce(
    (acc: string[], key: string) => {
      if (DEFAULT_SHARE_SCOPE[key]) {
        acc.push(
          `[nextjs-mf] You are sharing ${key} from the default share scope. This is not necessary and can be removed.`
        );
        // Use a type assertion to inform TypeScript that 'key' can be used as an index for the 'shared' object
        delete (shared as { [key: string]: unknown })[key];
      }
      return acc;
    },
    []
  );

  if (warnings.length > 0) {
    console.warn('%c' + warnings.join('\n'), 'color: red');
  }
}
