/*
 * @jest-environment node
 */

describe('Module Exports', () => {
  describe('sharing namespace', () => {
    it('should export ConsumeSharedModule', () => {
      const { sharing } = require('../../src/index');

      expect(sharing).toBeDefined();
      expect(sharing.ConsumeSharedModule).toBeDefined();
      expect(typeof sharing.ConsumeSharedModule).toBe('function');
    });

    it('should export ProvideSharedModule', () => {
      const { sharing } = require('../../src/index');

      expect(sharing).toBeDefined();
      expect(sharing.ProvideSharedModule).toBeDefined();
      expect(typeof sharing.ProvideSharedModule).toBe('function');
    });

    it('should lazy-load modules correctly', () => {
      const { sharing } = require('../../src/index');

      // Access the modules multiple times to ensure lazy loading works
      const ConsumeSharedModule1 = sharing.ConsumeSharedModule;
      const ConsumeSharedModule2 = sharing.ConsumeSharedModule;
      const ProvideSharedModule1 = sharing.ProvideSharedModule;
      const ProvideSharedModule2 = sharing.ProvideSharedModule;

      // Should be the same reference (lazy loading)
      expect(ConsumeSharedModule1).toBe(ConsumeSharedModule2);
      expect(ProvideSharedModule1).toBe(ProvideSharedModule2);
    });
  });

  describe('backward compatibility', () => {
    it('should maintain existing exports', () => {
      const enhanced = require('../../src/index');

      // Verify existing exports still work
      expect(enhanced.ModuleFederationPlugin).toBeDefined();
      expect(enhanced.ContainerReferencePlugin).toBeDefined();
      expect(enhanced.SharePlugin).toBeDefined();
      expect(enhanced.ContainerPlugin).toBeDefined();
      expect(enhanced.ConsumeSharedPlugin).toBeDefined();
      expect(enhanced.ProvideSharedPlugin).toBeDefined();
      expect(enhanced.FederationModulesPlugin).toBeDefined();
      expect(enhanced.FederationRuntimePlugin).toBeDefined();
      expect(enhanced.AsyncBoundaryPlugin).toBeDefined();
      expect(enhanced.HoistContainerReferencesPlugin).toBeDefined();
      expect(enhanced.dependencies).toBeDefined();
      expect(enhanced.container).toBeDefined();
      expect(enhanced.parseOptions).toBeDefined();
      expect(enhanced.createModuleFederationConfig).toBeDefined();
    });
  });
});
