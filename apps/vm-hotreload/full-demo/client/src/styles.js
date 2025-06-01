// Style Manager Module - Hot Reloadable
export class StyleManager {
  constructor() {
    this.version = '1.0.0';
    this.styles = {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Courier New, monospace',
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
        xlarge: '32px',
      },
      theme: 'light',
    };
    console.log('🎨 StyleManager initialized');
  }

  apply() {
    console.log('🖌️ Applying styles:');
    console.log(`  Theme: ${this.styles.theme}`);
    console.log(`  Primary Color: ${this.styles.colors.primary}`);
    console.log(`  Primary Font: ${this.styles.fonts.primary}`);
    console.log(`  Base Spacing: ${this.styles.spacing.medium}`);
    console.log(`  Version: ${this.version}`);

    // Simulate applying styles to DOM (in a real app)
    this.injectStyles();
  }

  injectStyles() {
    // In a real application, this would inject CSS into the DOM
    console.log('💉 Injecting CSS styles (simulated)');
    const cssRules = [
      `body { font-family: ${this.styles.fonts.primary}; }`,
      `h1 { color: ${this.styles.colors.primary}; }`,
      `.container { padding: ${this.styles.spacing.medium}; }`,
    ];
    console.log('📝 CSS Rules:', cssRules);
  }

  update(newStyleManager) {
    console.log('🔄 Updating styles...');
    const oldVersion = this.version;
    Object.assign(this, newStyleManager);
    console.log(`✅ Styles updated from ${oldVersion} to ${this.version}`);
    this.apply();
  }

  setTheme(theme) {
    this.styles.theme = theme;
    console.log(`🌓 Theme changed to: ${theme}`);
    this.apply();
  }

  setColor(colorName, colorValue) {
    if (this.styles.colors[colorName] !== undefined) {
      this.styles.colors[colorName] = colorValue;
      console.log(`🎨 Color '${colorName}' updated to: ${colorValue}`);
      this.apply();
    }
  }

  setFont(fontName, fontValue) {
    if (this.styles.fonts[fontName] !== undefined) {
      this.styles.fonts[fontName] = fontValue;
      console.log(`🔤 Font '${fontName}' updated to: ${fontValue}`);
      this.apply();
    }
  }

  getComputedStyle(element) {
    // Simulate getting computed styles
    return {
      color: this.styles.colors.primary,
      fontFamily: this.styles.fonts.primary,
      padding: this.styles.spacing.medium,
    };
  }

  getStats() {
    return {
      version: this.version,
      theme: this.styles.theme,
      colorCount: Object.keys(this.styles.colors).length,
      fontCount: Object.keys(this.styles.fonts).length,
      lastApplied: new Date().toISOString(),
    };
  }
}

// HMR acceptance
if (module.hot) {
  module.hot.accept();
  console.log('🔥 StyleManager module accepts HMR');
}
