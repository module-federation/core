const util = require('util');

it('should load App with React and remote component', () => {
   return import('./App').then(({ default: App }) => {
    //console.log('6-layers-full Share Scopes:', util.inspect(__webpack_share_scopes__, { depth: 3, colors: true }));
  console.log('6-layers-full Federation:', util.inspect(__FEDERATION__, { depth: 2, colors: true }));

    const rendered = App();
    expect(rendered).toContain('App rendered with React version:');
    expect(rendered).toContain('remote component:');
  });
});
