export interface VersionComponent {
  operator: string;
  version: string;
  major: string;
  minor: string;
  patch: string;
  preRelease?: string[];
}

function compareComponent(
  component1: string | number,
  component2: string | number,
): number {
  const comp1 = Number(component1) || component1;
  const comp2 = Number(component2) || component2;

  if (comp1 > comp2) {
    return 1;
  }
  if (comp1 === comp2) {
    return 0;
  }
  return -1;
}

function comparePreReleaseComponents(
  component1: VersionComponent,
  component2: VersionComponent,
): number {
  const { preRelease: preRelease1 } = component1;
  const { preRelease: preRelease2 } = component2;

  if (!preRelease1 && preRelease2) {
    return 1;
  }
  if (preRelease1 && !preRelease2) {
    return -1;
  }
  if (!preRelease1 && !preRelease2) {
    return 0;
  }

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  for (let i = 0; i <= preRelease1!.length; i++) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const element1 = preRelease1![i];
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const element2 = preRelease2![i];

    if (element1 === element2) {
      continue;
    }
    if (!element1 && !element2) {
      return 0;
    }
    if (!element1) {
      return 1;
    }
    if (!element2) {
      return -1;
    }
    return compareComponent(element1, element2);
  }

  return 0;
}

function compareVersionComponents(
  component1: VersionComponent,
  component2: VersionComponent,
): number {
  return (
    compareComponent(component1.major, component2.major) ||
    compareComponent(component1.minor, component2.minor) ||
    compareComponent(component1.patch, component2.patch) ||
    comparePreReleaseComponents(component1, component2)
  );
}

function isEqual(
  component1: VersionComponent,
  component2: VersionComponent,
): boolean {
  return component1.version === component2.version;
}

export function compare(
  component1: VersionComponent,
  component2: VersionComponent,
): boolean {
  switch (component1.operator) {
    case '':
    case '=':
      return isEqual(component1, component2);
    case '>':
      return compareVersionComponents(component1, component2) < 0;
    case '>=':
      return (
        isEqual(component1, component2) ||
        compareVersionComponents(component1, component2) < 0
      );
    case '<':
      return compareVersionComponents(component1, component2) > 0;
    case '<=':
      return (
        isEqual(component1, component2) ||
        compareVersionComponents(component1, component2) > 0
      );
    case undefined:
      // means * or x -> all versions
      return true;
    default:
      return false;
  }
}
