import vm from 'node:vm';

(globalThis as Record<string, unknown>).ENV_TARGET = 'node';
try {
  vm.runInThisContext("var ENV_TARGET = 'node'");
} catch {
  // best effort
}
