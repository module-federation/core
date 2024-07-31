export const routes = [
  {
    path: '/',
    children: [
      {
        _component: '@_modern_js_src/routes/page',
        index: true,
        id: 'page',
        type: 'nested',
      },
    ],
    isRoot: true,
    _component: '@_modern_js_src/routes/layout',
    id: 'layout',
    type: 'nested',
  },
];
