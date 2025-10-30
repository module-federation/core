/**
 * Type tests to verify that bridge component types are correctly generated
 * These tests ensure that the TypeScript compiler can properly infer types
 */

import { createBridgeComponent } from '../provider/versions/legacy';
import { createBridgeComponent as createBridgeComponentV18 } from '../provider/versions/v18';
import type { BridgeComponent } from '../types';

// Test component props interface
interface WidgetProps {
  text: string;
  number: number;
}

// Mock component for testing
const MockWidget: React.ComponentType<WidgetProps> = () => null;

describe('Bridge Component Types', () => {
  it('should have correct return type for legacy createBridgeComponent', () => {
    const WidgetBridge = createBridgeComponent({
      rootComponent: MockWidget,
    });

    const bridgeInstance = WidgetBridge();

    // Type assertions to verify the interface
    expect(typeof bridgeInstance.render).toBe('function');
    expect(typeof bridgeInstance.destroy).toBe('function');
    expect(bridgeInstance.rawComponent).toBe(MockWidget);
    expect(typeof bridgeInstance.__BRIDGE_FN__).toBe('function');

    // Verify the bridge instance matches the BridgeComponent interface
    const typedInstance: BridgeComponent<WidgetProps> = bridgeInstance;
    expect(typedInstance).toBeDefined();
  });

  it('should have correct return type for v18 createBridgeComponent', () => {
    const WidgetBridge = createBridgeComponentV18({
      rootComponent: MockWidget,
    });

    const bridgeInstance = WidgetBridge();

    // Type assertions to verify the interface
    expect(typeof bridgeInstance.render).toBe('function');
    expect(typeof bridgeInstance.destroy).toBe('function');
    expect(bridgeInstance.rawComponent).toBe(MockWidget);
    expect(typeof bridgeInstance.__BRIDGE_FN__).toBe('function');

    // Verify the bridge instance matches the BridgeComponent interface
    const typedInstance: BridgeComponent<WidgetProps> = bridgeInstance;
    expect(typedInstance).toBeDefined();
  });

  it('should properly infer component props types', () => {
    const WidgetBridge = createBridgeComponent({
      rootComponent: MockWidget,
    });

    const bridgeInstance = WidgetBridge();

    // Test that __BRIDGE_FN__ accepts the correct props type
    bridgeInstance.__BRIDGE_FN__({ text: 'test', number: 42 });

    // This should cause a TypeScript error if types are incorrect:
    // bridgeInstance.__BRIDGE_FN__({ text: 'test' }); // missing 'number'
    // bridgeInstance.__BRIDGE_FN__({ text: 'test', number: 'invalid' }); // wrong type
  });
});

// Type-only tests (these will be checked by TypeScript compiler)
type TestBridgeComponentType = ReturnType<
  typeof createBridgeComponent<WidgetProps>
>;
type TestBridgeInstanceType = ReturnType<TestBridgeComponentType>;

// Verify that the bridge instance has all required properties
type RequiredProperties = keyof BridgeComponent<WidgetProps>;
const requiredProps: RequiredProperties[] = [
  'render',
  'destroy',
  'rawComponent',
  '__BRIDGE_FN__',
];

// Verify that rawComponent has the correct type
type RawComponentType = TestBridgeInstanceType['rawComponent'];
const _rawComponentTypeCheck: RawComponentType = MockWidget;

// Verify that __BRIDGE_FN__ has the correct signature
type BridgeFnType = TestBridgeInstanceType['__BRIDGE_FN__'];
const _bridgeFnTypeCheck: BridgeFnType = (args: WidgetProps) => {};
