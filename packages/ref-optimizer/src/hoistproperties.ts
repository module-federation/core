import { declare } from '@babel/helper-plugin-utils';
import type { NodePath, PluginPass, ConfigAPI, BabelFile } from '@babel/core';
import * as t from '@babel/types';
import type { PluginObj, Visitor } from '@babel/core';

// Define the structure for property configurations passed in options
interface PropertyConfig {
  propertyName: string;
  constantName: string;
  // minOccurrences?: number; // Not directly needed by Babel transform
}

// Define the expected plugin options
interface HoistPropertiesOptions {
  propertyConfigs?: PropertyConfig[];
  virtualModuleId?: string;
  propertyRules?: {
    excludeFromDestructuring?: string[];
  };
}

// Define the state structure for the plugin pass
interface HoistPropertiesPluginPass extends PluginPass {
  constantsToImport?: Set<string>;
  propToConstMap?: Map<string, string>;
  virtualModuleId?: string;
  didTransform?: boolean; // Flag to track if any transformation occurred
  excludeDestructuringSet?: Set<string>;
}

// Use proper type definition for the plugin
export default declare(
  (
    api: ConfigAPI,
    options: HoistPropertiesOptions,
    dirname: string,
  ): PluginObj<HoistPropertiesPluginPass> => {
    api.assertVersion(7);

    const {
      propertyConfigs = [],
      virtualModuleId = 'virtual:property-literals',
    } = options;
    const excludeFromDestructuring =
      options.propertyRules?.excludeFromDestructuring || [];

    if (!propertyConfigs || propertyConfigs.length === 0) {
      // No configuration, the plugin does nothing.
      // Optionally, log a warning during build if this is unexpected.
      return {
        name: 'hoist-properties',
        visitor: {}, // Empty visitor to satisfy PluginObj type
      };
    }

    return {
      name: 'hoist-properties',

      // Use pre to initialize state per file
      pre(this: HoistPropertiesPluginPass, file: BabelFile) {
        this.constantsToImport = new Set<string>();
        this.propToConstMap = new Map<string, string>(
          propertyConfigs.map((config) => [
            config.propertyName,
            config.constantName,
          ]),
        );
        this.virtualModuleId = virtualModuleId;
        this.didTransform = false;
        this.excludeDestructuringSet = new Set(excludeFromDestructuring);
      },

      visitor: {
        // Handle optional chaining expressions
        OptionalMemberExpression(
          path: NodePath<t.OptionalMemberExpression>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          if (!propToConstMap) return;

          let propertyName: string | null = null;

          // Check for obj?.prop
          if (!node.computed && t.isIdentifier(node.property)) {
            propertyName = node.property.name;
          }
          // Check for obj?.['prop']
          else if (node.computed && t.isStringLiteral(node.property)) {
            propertyName = node.property.value;
          }

          if (propertyName && propToConstMap.has(propertyName)) {
            const constantName = propToConstMap.get(propertyName)!;
            state.constantsToImport?.add(constantName);
            state.didTransform = true;

            // Replace with obj?.[CONSTANT_NAME]
            path.replaceWith(
              t.optionalMemberExpression(
                node.object,
                t.identifier(constantName),
                true, // computed = true
                node.optional, // preserve optional chaining
              ),
            );
          }
        },

        // Handle destructuring patterns in variable declarations and function parameters
        ObjectPattern(
          path: NodePath<t.ObjectPattern>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;

          if (!propToConstMap) return;

          // Process each property in the destructuring pattern
          for (const property of node.properties) {
            if (!t.isObjectProperty(property)) continue; // Skip RestElement

            let propertyName: string | null = null;

            // Handle different key types
            if (t.isIdentifier(property.key) && !property.computed) {
              propertyName = property.key.name;
            } else if (t.isStringLiteral(property.key) && !property.computed) {
              propertyName = property.key.value;
            }

            if (propertyName && propToConstMap.has(propertyName)) {
              const constantName = propToConstMap.get(propertyName)!;
              state.constantsToImport?.add(constantName);
              state.didTransform = true;

              // Always use the original property name as the variable name
              const variableName = t.identifier(propertyName);

              // Change the key to the computed constant
              property.key = t.identifier(constantName);
              property.computed = true;
              property.shorthand = false;

              // Handle the value part
              if (t.isAssignmentPattern(property.value)) {
                // Case: { from = 'runtime' }
                property.value = t.assignmentPattern(
                  variableName,
                  property.value.right,
                );
              } else {
                // Case: { from } or { from: someOtherName }
                // If it was shorthand, use the original property name
                // If it wasn't shorthand, keep the original value
                property.value = property.shorthand
                  ? variableName
                  : property.value;
              }
            }
          }
        },

        // Handle object literals and their properties
        ObjectExpression(
          path: NodePath<t.ObjectExpression>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          if (!propToConstMap) return;

          for (const property of node.properties) {
            // Skip spread elements
            if (!t.isObjectProperty(property) && !t.isObjectMethod(property))
              continue;

            let propertyName: string | null = null;
            let isShorthand = false;

            // Handle methods { method() {} }
            if (t.isObjectMethod(property)) {
              if (!property.computed && t.isIdentifier(property.key)) {
                propertyName = property.key.name;
              } else if (
                !property.computed &&
                t.isStringLiteral(property.key)
              ) {
                propertyName = property.key.value;
              }
              // Handle properties { key: value } or { shorthand }
            } else if (t.isObjectProperty(property)) {
              isShorthand = property.shorthand;
              if (!property.computed && t.isIdentifier(property.key)) {
                propertyName = property.key.name;
              } else if (
                !property.computed &&
                t.isStringLiteral(property.key)
              ) {
                propertyName = property.key.value;
              }
            }

            if (
              propertyName &&
              propToConstMap.has(propertyName) &&
              !property.computed
            ) {
              const constantName = propToConstMap.get(propertyName)!;
              state.constantsToImport?.add(constantName);
              state.didTransform = true;

              if (isShorthand && t.isObjectProperty(property)) {
                // Transform { prop } to { [RC_PROP]: prop }
                if (t.isIdentifier(property.key)) {
                  const originalIdentifierName = property.key.name; // Store original name
                  property.key = t.identifier(constantName);
                  property.computed = true;
                  property.shorthand = false; // No longer shorthand
                  // Explicitly set the value to the original identifier
                  property.value = t.identifier(originalIdentifierName);
                } else {
                  // This case should theoretically not happen for valid shorthand properties
                  // but we handle it defensively.
                  property.key = t.identifier(constantName);
                  property.computed = true;
                  property.shorthand = false;
                  // We might lose the original value here if the key wasn't an identifier
                  // but Babel might error earlier on invalid shorthand syntax.
                }
              } else {
                // Transform { prop: value } to { [RC_PROP]: value } or { method() } to { [RC_METHOD]() }
                property.key = t.identifier(constantName);
                property.computed = true;
              }
            }
          }
        },

        // Handle obj.prop and obj['prop']
        MemberExpression(
          path: NodePath<t.MemberExpression>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          if (!propToConstMap) return;

          let propertyName: string | null = null;

          // Check for obj.prop
          if (!node.computed && t.isIdentifier(node.property)) {
            propertyName = node.property.name;
          }
          // Check for obj['prop']
          else if (node.computed && t.isStringLiteral(node.property)) {
            propertyName = node.property.value;
          }

          if (propertyName && propToConstMap.has(propertyName)) {
            const constantName = propToConstMap.get(propertyName)!;
            state.constantsToImport?.add(constantName);
            state.didTransform = true;

            // Replace with obj[CONSTANT_NAME]
            path.replaceWith(
              t.memberExpression(
                node.object,
                t.identifier(constantName),
                true, // computed = true
              ),
            );
          }
        },

        // Handle { prop: ... } and { 'prop': ... }
        // NOTE: This visitor might become redundant or need adjustment after changes to ObjectExpression
        ObjectProperty(
          path: NodePath<t.ObjectProperty>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          // Keep skipping computed, but remove shorthand skip as ObjectExpression handles it
          if (!propToConstMap || node.computed) return;

          // If ObjectExpression didn't handle it (e.g., not inside an ObjectExpression),
          // process non-shorthand properties here.
          if (!node.shorthand) {
            let propertyName: string | null = null;
            if (t.isIdentifier(node.key)) {
              propertyName = node.key.name;
            } else if (t.isStringLiteral(node.key)) {
              propertyName = node.key.value;
            }

            if (propertyName && propToConstMap.has(propertyName)) {
              const constantName = propToConstMap.get(propertyName)!;
              state.constantsToImport?.add(constantName);
              state.didTransform = true;

              // Replace key with computed [CONSTANT_NAME]
              node.key = t.identifier(constantName);
              node.computed = true;
            }
          }
        },

        // Handle shorthand properties { prop } -> { [PROP_CONST]: prop }
        ObjectMethod(
          path: NodePath<t.ObjectMethod>,
          state: HoistPropertiesPluginPass,
        ) {
          // Also handles object methods like { prop() {} }
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          if (!propToConstMap || node.computed) return;

          let propertyName: string | null = null;
          if (t.isIdentifier(node.key)) {
            propertyName = node.key.name;
          } else if (t.isStringLiteral(node.key)) {
            propertyName = node.key.value;
          }

          if (propertyName && propToConstMap.has(propertyName)) {
            const constantName = propToConstMap.get(propertyName)!;
            state.constantsToImport?.add(constantName);
            state.didTransform = true;
            node.key = t.identifier(constantName);
            node.computed = true;
          }
        },

        // Handle class { prop = ... }
        ClassProperty(
          path: NodePath<t.ClassProperty>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          if (!propToConstMap || node.computed) return;

          let propertyName: string | null = null;
          if (t.isIdentifier(node.key)) {
            propertyName = node.key.name;
          }
          // Class properties usually don't have string literal keys unless computed

          if (propertyName && propToConstMap.has(propertyName)) {
            const constantName = propToConstMap.get(propertyName)!;
            state.constantsToImport?.add(constantName);
            state.didTransform = true;
            node.key = t.identifier(constantName);
            node.computed = true;
          }
        },

        // Handle class { prop() { ... } }
        ClassMethod(
          path: NodePath<t.ClassMethod>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          // Skip constructor, handle only non-computed methods/getters/setters
          if (!propToConstMap || node.computed || node.kind === 'constructor')
            return;

          let propertyName: string | null = null;
          if (t.isIdentifier(node.key)) {
            propertyName = node.key.name;
          }
          // Class methods usually don't have string literal keys unless computed

          if (propertyName && propToConstMap.has(propertyName)) {
            const constantName = propToConstMap.get(propertyName)!;
            state.constantsToImport?.add(constantName);
            state.didTransform = true;
            node.key = t.identifier(constantName);
            node.computed = true;
          }
        },

        // Handle string literals matching property names
        StringLiteral(
          path: NodePath<t.StringLiteral>,
          state: HoistPropertiesPluginPass,
        ) {
          const { node } = path;
          const propToConstMap = state.propToConstMap;
          if (!propToConstMap) return;

          const propertyName = node.value;

          // Check if this string matches a property name we are hoisting
          if (propToConstMap.has(propertyName)) {
            // Avoid replacing import/export sources or object keys that are already computed
            const parent = path.parentPath;
            if (
              parent?.isImportDeclaration() ||
              parent?.isExportNamedDeclaration() ||
              parent?.isExportAllDeclaration() ||
              (parent?.isObjectProperty({ key: node }) &&
                parent.node.computed) ||
              (parent?.isMemberExpression({ property: node }) &&
                parent.node.computed)
            ) {
              return;
            }

            const constantName = propToConstMap.get(propertyName)!;
            state.constantsToImport?.add(constantName);
            state.didTransform = true;

            // Replace the string literal with the identifier
            try {
              path.replaceWith(t.identifier(constantName));
            } catch (e) {
              // Handle cases where replacing might not be valid (e.g. replacing object key directly)
              // In many cases, the ObjectProperty/MemberExpression visitors handle the key replacement
              // console.warn(`Could not replace string literal "${propertyName}" with identifier ${constantName} directly in ${parent?.node.type}`);
            }
          }
        },

        // Handle function parameters with default values
        AssignmentPattern(
          path: NodePath<t.AssignmentPattern>,
          state: HoistPropertiesPluginPass,
        ) {
          const parentPath = path.parentPath;

          // Check 1: Is it inside an ObjectProperty (handled by ObjectPattern visitor)?
          if (parentPath.isObjectProperty()) {
            return;
          }

          // Check 2: Is it a direct function parameter or nested within a function parameter's destructuring?
          let isFunctionParamContext = false;
          const funcParentPath = path.findParent((p) => p.isFunction());

          if (funcParentPath && funcParentPath.node) {
            const funcNode = funcParentPath.node;
            // Ensure funcNode is a type that has 'params' (e.g., FunctionDeclaration, ArrowFunctionExpression, etc.)
            // Use a type guard or check if 'params' property exists.
            if ('params' in funcNode && Array.isArray(funcNode.params)) {
              for (const param of funcNode.params) {
                // Direct parameter: function(arg = defaultValue) {}
                if (param === path.node) {
                  isFunctionParamContext = true;
                  break;
                }
                // Parameter within object destructuring: function({ arg = defaultValue }) {}
                if (t.isObjectPattern(param)) {
                  for (const prop of param.properties) {
                    if (t.isObjectProperty(prop) && prop.value === path.node) {
                      isFunctionParamContext = true;
                      break;
                    }
                  }
                }
                // Parameter within array destructuring: function([arg = defaultValue]) {}
                if (t.isArrayPattern(param)) {
                  for (const element of param.elements) {
                    // Check if the element itself is the AssignmentPattern
                    if (element === path.node) {
                      isFunctionParamContext = true;
                      break;
                    }
                    // Check if the element is a RestElement containing the AssignmentPattern (unlikely but possible)
                    if (
                      t.isRestElement(element) &&
                      element.argument === path.node
                    ) {
                      isFunctionParamContext = true;
                      break;
                    }
                  }
                }
                if (isFunctionParamContext) break;
              }
            }
          }

          if (isFunctionParamContext) {
            return; // Do not transform function parameter names or their defaults in this context
          }

          // --- Logic for other AssignmentPatterns (if any) ---
          // This section remains commented out as it's likely incorrect or unnecessary for this plugin's purpose.
          /*
        const { node } = path;
        const propToConstMap = state.propToConstMap;
        if (!propToConstMap || !t.isIdentifier(node.left)) return;

        const propertyName = node.left.name;
        if (propToConstMap.has(propertyName)) {
          const constantName = propToConstMap.get(propertyName)!;
          state.constantsToImport?.add(constantName);
          state.didTransform = true;

          path.replaceWith(
            t.assignmentPattern(
              t.identifier(constantName),
              node.right
            )
          );
        }
        */
        },

        // Use Program.exit to add imports once the whole file is traversed
        Program: {
          exit(path: NodePath<t.Program>, state: HoistPropertiesPluginPass) {
            const constants = state.constantsToImport;
            const moduleId = state.virtualModuleId;
            const didTransform = state.didTransform;

            // Only add import if transformations occurred and constants were needed
            if (
              !didTransform ||
              !constants ||
              constants.size === 0 ||
              !moduleId
            ) {
              return;
            }

            // Create specifiers
            const importSpecifiersToAdd = Array.from(constants)
              .sort()
              .map((name) =>
                t.importSpecifier(t.identifier(name), t.identifier(name)),
              );

            // Find existing import declaration using find instead of forEach
            const existingImportDecl = path
              .get('body')
              .find(
                (bodyPath): bodyPath is NodePath<t.ImportDeclaration> =>
                  bodyPath.isImportDeclaration() &&
                  bodyPath.node.source.value === moduleId,
              );

            if (existingImportDecl) {
              const existingSpecifiers = existingImportDecl.node.specifiers;
              const existingNames = new Set(
                existingSpecifiers
                  .filter(
                    (spec): spec is t.ImportSpecifier =>
                      t.isImportSpecifier(spec) &&
                      (t.isIdentifier(spec.imported) ||
                        t.isStringLiteral(spec.imported)),
                  )
                  .map((spec) =>
                    t.isIdentifier(spec.imported)
                      ? spec.imported.name
                      : spec.imported.value,
                  ),
              );

              importSpecifiersToAdd.forEach((spec) => {
                if (
                  t.isIdentifier(spec.imported) &&
                  !existingNames.has(spec.imported.name)
                ) {
                  existingSpecifiers.push(spec);
                }
              });

              existingSpecifiers.sort((a, b) => {
                let nameA = '';
                if (t.isImportSpecifier(a) && t.isIdentifier(a.imported)) {
                  nameA = a.imported.name;
                } else if (
                  t.isImportDefaultSpecifier(a) ||
                  t.isImportNamespaceSpecifier(a)
                ) {
                  nameA = a.local.name;
                }

                let nameB = '';
                if (t.isImportSpecifier(b) && t.isIdentifier(b.imported)) {
                  nameB = b.imported.name;
                } else if (
                  t.isImportDefaultSpecifier(b) ||
                  t.isImportNamespaceSpecifier(b)
                ) {
                  nameB = b.local.name;
                }

                return nameA.localeCompare(nameB);
              });
            } else {
              // Create a new import declaration
              const newImportDecl = t.importDeclaration(
                importSpecifiersToAdd,
                t.stringLiteral(moduleId),
              );
              // Add the new import declaration to the top of the file body
              path.unshiftContainer('body', newImportDecl);
            }
          },
        },
      },
    };
  },
);
