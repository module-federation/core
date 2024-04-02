function getTypedName(name: string) {
  return `@types/${name.replace(/^@/, '').replace('/', '__')}`;
}

export { getTypedName };
