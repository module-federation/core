export = FakeDocument;
declare class FakeDocument {
  constructor(basePath: any);
  head: FakeElement;
  body: FakeElement;
  baseURI: string;
  _elementsByTagName: Map<string, FakeElement[]>;
  _basePath: any;
  createElement(type: any): FakeElement;
  _onElementAttached(element: any): void;
  _onElementRemoved(element: any): void;
  getElementsByTagName(name: any): FakeElement[];
  getComputedStyle(element: any): {
    getPropertyValue: (property: any) => any;
  };
}
declare class FakeElement {
  constructor(document: any, type: any, basePath: any);
  _document: any;
  _type: any;
  _children: any[];
  _attributes: any;
  _src: any;
  _href: any;
  parentNode: any;
  sheet: FakeSheet;
  appendChild(node: any): void;
  removeChild(node: any): void;
  setAttribute(name: any, value: any): void;
  removeAttribute(name: any): void;
  getAttribute(name: any): any;
  _toRealUrl(value: any): any;
  set src(arg: any);
  get src(): any;
  set href(arg: any);
  get href(): any;
}
declare class FakeSheet {
  constructor(element: any, basePath: any);
  _element: any;
  _basePath: any;
  get css(): string;
  get cssRules(): any[];
}
