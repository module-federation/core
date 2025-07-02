// UI Components Module - Hot Reloadable
export class UIComponents {
  constructor() {
    this.version = '1.0.0';
    this.components = {
      header: 'Welcome to HMR Demo',
      content: 'This is a hot-reloadable component',
      footer: 'Powered by Webpack HMR',
    };
    console.log('🎨 UIComponents initialized');
  }

  render() {
    console.log('🖼️ Rendering UI Components:');
    console.log(`  Header: ${this.components.header}`);
    console.log(`  Content: ${this.components.content}`);
    console.log(`  Footer: ${this.components.footer}`);
    console.log(`  Version: ${this.version}`);
  }

  update(newComponents) {
    console.log('🔄 Updating UI Components...');
    // Preserve state during hot reload
    const oldVersion = this.version;
    Object.assign(this, newComponents);
    console.log(
      `✅ UI Components updated from ${oldVersion} to ${this.version}`,
    );
    this.render();
  }

  setHeader(text) {
    this.components.header = text;
    console.log(`📝 Header updated: ${text}`);
  }

  setContent(text) {
    this.components.content = text;
    console.log(`📝 Content updated: ${text}`);
  }

  setFooter(text) {
    this.components.footer = text;
    console.log(`📝 Footer updated: ${text}`);
  }

  getStats() {
    return {
      version: this.version,
      componentCount: Object.keys(this.components).length,
      lastRendered: new Date().toISOString(),
    };
  }
}

// HMR acceptance
if (module.hot) {
  module.hot.accept();
  console.log('🔥 UIComponents module accepts HMR');
}
