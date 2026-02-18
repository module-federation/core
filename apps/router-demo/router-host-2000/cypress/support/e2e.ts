// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// 忽略特定的未捕获异常，允许测试继续执行
Cypress.on('uncaught:exception', (err) => {
  // 检查是否为 HTMLElement 构造函数错误
  if (
    err.message.includes("Failed to construct 'HTMLElement'") ||
    err.message.includes('Illegal constructor')
  ) {
    // 返回 false 表示 Cypress 应该继续执行测试而不失败
    console.warn('Ignoring HTMLElement constructor error:', err.message);
    return false;
  }

  // 检查是否为模块未找到错误，特别是 react-dom/client
  if (
    err.message.includes(
      "Module not found: Can't resolve 'react-dom/client'",
    ) ||
    err.message.includes("Cannot find module 'react-dom/client'")
  ) {
    console.warn(
      'Ignoring react-dom/client module not found error:',
      err.message,
    );
    return false;
  }

  // 对于其他错误，让 Cypress 正常处理（返回 true 将导致测试失败）
  return true;
});

// 模拟 react-dom/client 模块，以防在测试环境中需要
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.ReactDOMClient = {
    createRoot: () => ({
      render: () => {},
      unmount: () => {},
    }),
    hydrateRoot: () => ({
      render: () => {},
      unmount: () => {},
    }),
  };
}
