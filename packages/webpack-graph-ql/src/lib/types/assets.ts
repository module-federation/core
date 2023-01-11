import { AutoSchema } from "./auto-schema";
import { returns } from "../utils";

export type AssetsByChunkName = {
  [chunkName: string]: string[] | string; 
}

// Resolvers for the "assets" field
export class Assets extends AutoSchema {

  _name: string;
  _size: number;
  _chunkNames: string[];

  @returns(String)
  get name() {
    return this._name;
  }

  @returns("Int")
  get size(parent: any) {
    return this._size;
  }

  @returns([String])
  chunkNames(parent: any) {
    return this._chunkNames;
  }

};
