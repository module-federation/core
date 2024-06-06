chrome.devtools.panels.create(
  'Module Federation',
  '',
  '/html/main/index.html',
  function (panel) {
    console.log('Create Module Federation Devtools Success', panel);
  },
);
