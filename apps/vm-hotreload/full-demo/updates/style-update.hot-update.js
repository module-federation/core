exports.id = 'index';
exports.ids = null;
exports.modules = {
  /***/ './src/styles.js':
    /*!************************!\
  !*** ./src/styles.js ***!\
  \************************/
    /***/ (module, exports) => {
      class StyleManager {
        constructor() {
          this.version = '2.0';
          this.styles = {
            colors: {
              primary: '#e74c3c',
              secondary: '#f39c12',
              success: '#2ecc71',
              danger: '#e74c3c',
              warning: '#f39c12',
              info: '#3498db',
            },
            fonts: {
              primary: 'Inter, Arial, sans-serif',
              secondary: 'Georgia, serif',
              monospace: 'Fira Code, Courier New, monospace',
            },
            spacing: {
              small: '8px',
              medium: '16px',
              large: '24px',
              xlarge: '32px',
            },
            theme: 'enhanced-dark',
          };
          console.log(
            '🎨 StyleManager updated to enhanced version',
            this.version,
          );
        }

        apply() {
          console.log('🖌️ Applying enhanced styles:');
          console.log(`  Theme: ${this.styles.theme}`);
          console.log(`  Primary Color: ${this.styles.colors.primary}`);
          console.log(`  Primary Font: ${this.styles.fonts.primary}`);
          console.log(`  Base Spacing: ${this.styles.spacing.medium}`);
          console.log(`  Version: ${this.version}`);

          // Enhanced style injection
          this.injectStyles();
        }

        injectStyles() {
          console.log('💉 Injecting enhanced CSS styles');
          const cssRules = [
            `body { font-family: ${this.styles.fonts.primary}; background: #1a1a1a; color: #ecf0f1; }`,
            `h1 { color: ${this.styles.colors.primary}; font-weight: 600; }`,
            `.container { padding: ${this.styles.spacing.large}; border-radius: 8px; }`,
            `.enhanced { background: linear-gradient(135deg, ${this.styles.colors.primary}, ${this.styles.colors.secondary}); }`,
          ];
          console.log('📝 Enhanced CSS Rules:', cssRules);
        }

        update(newStyles) {
          console.log('🔄 Updating styles with enhanced features...');
          const oldVersion = this.version;
          Object.assign(this, newStyles);
          console.log(
            `✅ Styles updated from ${oldVersion} to ${this.version}`,
          );
          this.apply();
        }

        setTheme(theme) {
          this.styles.theme = theme;
          console.log(`📝 Theme updated: ${theme}`);
          this.apply();
        }

        setColor(colorName, value) {
          if (this.styles.colors.hasOwnProperty(colorName)) {
            this.styles.colors[colorName] = value;
            console.log(`🎨 Color '${colorName}' updated to: ${value}`);
            this.apply();
          }
        }

        getStats() {
          return {
            version: this.version,
            theme: this.styles.theme,
            colorCount: Object.keys(this.styles.colors).length,
            fontCount: Object.keys(this.styles.fonts).length,
            lastApplied: new Date().toISOString(),
            features: [
              'enhanced-dark-theme',
              'gradient-support',
              'modern-fonts',
            ],
          };
        }
      }

      module.exports = { StyleManager };

      console.log('🎨 Enhanced Style Manager loaded with HMR support');

      if (true) {
        console.log('styles.js hot reload has module.hot');
        // HMR self-accept for styles
      }

      // Simulated edit at ' + new Date().toISOString() + '

      /***/
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  // webpackRuntimeModules
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'style-update-hash';
    /******/
  })();
  /******/
  /******/
};
