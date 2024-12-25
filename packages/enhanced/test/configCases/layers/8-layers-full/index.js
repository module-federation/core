const util = require('util');

it('should load App with React and both types of remote components', () => {
  return import('./App').then(({ default: App }) => {
    console.log('8-layers-full Federation:', util.inspect(__FEDERATION__, { depth: 2, colors: true }));
    console.log('8-layers-full Share Scopes:', util.inspect(__webpack_share_scopes__, { depth: 3, colors: true }));

    const rendered = App();
    expect(rendered).toContain('App rendered with React version:');
    expect(rendered).toContain('Non-layered remote component:');
    expect(rendered).toContain('Layered remote component:');
  });
});
