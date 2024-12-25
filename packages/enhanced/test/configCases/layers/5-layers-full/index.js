const util = require('util');

console.log('5-layers-full Share Scopes:', util.inspect(__webpack_share_scopes__, { depth: 3, colors: true }));
console.log('5-layers-full Federation:', util.inspect(__FEDERATION__, { depth: 3, colors: true }));

it('should load App with React', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toContain('App rendered with React version:');
  });
});
