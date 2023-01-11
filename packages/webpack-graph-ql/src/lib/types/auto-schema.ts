
export interface AutoSchemaCons {
    getFields(): Map<string, any>;
    getQueries(): Map<string, any>;
}

const typeMap = new Map();
const queryMap = new Map();
const mutationMap = new Map();
const fieldMap = new Map();

/**
 * The `AutoSchema` class is the base class for GraphQL types. It
 * provides a set of static methods that can be used to define and retrieve
 * the fields and queries of a GraphQL type.
 *
 * By using the `AutoSchema` class as a base class for their GraphQL types and
 * defining the fields and queries of their types using the `getFields` and
 * `getQueries` methods, developers can automatically generate a GraphQL
 * schema for their types. This can be useful for generating a schema on the
 * fly or for dynamically modifying a schema based on the data being queried.
 */
export abstract class AutoSchema {

  private static _type: any = null;
  private static _arrayType: any = null;

  /**
   * Returns the GraphQLObjectType object for this class.
   *
   * The object type represents a group of fields in the GraphQL schema and is
   * created using lazy initialization, meaning it is only created when it is
   * first needed.
   *
   * @return {GraphQLObjectType} The GraphQLObjectType object for this class.
   */
  static get type() {
    if (!this._type) {
      const fields = 
      this._type = new GraphQLObjectType({
        name: this.name,
        fields: this.getFieldConfigs()
      });
    }
    return this._type;
  }

  /**
   * Returns the GraphQLList object for this class.
   *
   * The GraphQLList object represents an array of objects in the GraphQL schema
   * and is created using lazy initialization, meaning it is only created when it
   * is first needed.
   *
   * @return {GraphQLList} The GraphQLList object for this class.
   */
  static get arrayType() {
    if (!this._arrayType) {
      this._arrayType = new GraphQLList(this.type)
    }
    return this._arrayType;
  }

  /**
   * Returns a Map of resolvers for the given class and all of its ancestors.
   * @param map - Map to retrieve resolvers from.
   * @returns Map<string, any> - Map of resolvers.
   */
  static getResolvers(resolverMap: Map<any, any>) {
    if (this === BuildableSchema) {
      return resolverMap.get(this);
    }
    const prototype: AutoSchemaCons = Reflect.getPrototypeOf(this);
    return new Map([
      ...(prototype?.getResolvers(resolverMap) ?? []),
      ...resolverMap.get(this);
    ])
  }

  /**
   * Returns a Map of field resolvers for the given class and all of its
   * ancestors.
   * @returns Map<string, any> - Map of field resolvers.
   */
  static getFields() {
    return this.getResolvers(fieldMap);
  }

  /**
   * Returns a Map of query resolvers for the given class and all of its
   * ancestors.
   * @returns Map<string, any> - Map of query resolvers.
   */
  static getQueries() {
    return this.getResolvers(queryMap);
  }

  /**
   * Returns a Map of mutation resolvers for the given class and all of its
   * ancestors.
   * @returns Map<string, any> - Map of mutation resolvers.
   */
  static getMutations() {
    return this.getResolvers(mutationMap);
  }

  /**
   * Returns a map of field configurations for the fields of this class.
   *
   * The field configurations define the properties of the fields in a
   * GraphQL schema and are created by mapping the field descriptors to field
   * configurations using the `reduce` function.
   *
   * @return {GraphQLFieldConfigMap<any, any>} A map of field configurations
   * for the fields of this class.
   */
  static getFieldConfigs() {
    return this
      .getFields()
      .entries()
      .reduce<GraphQLFieldConfigMap<any, any>>((
        fields,
        [ fieldName, descriptor ]
      ) => {
        fields[fieldName]: GraphQLFieldConfig<any, any> = {
          type: descriptor.type
        };
        return fields;
      }), {});
  }

}

