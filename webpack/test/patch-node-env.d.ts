export = CustomEnvironment;
declare class CustomEnvironment {
  constructor(config: any, context: any);
  handleTestEvent(event: any, state: any): Promise<void>;
}
