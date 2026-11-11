const inspectedTabId = chrome.devtools.inspectedWindow.tabId;

chrome.devtools.panels.create(
  'Module Federation',
  '',
  `/html/main/index.html?inspectedTabId=${encodeURIComponent(inspectedTabId)}`,
  function (panel) {
    console.log('Create Module Federation Devtools Success', panel);
  },
);
