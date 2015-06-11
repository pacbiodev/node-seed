// Type definitions for JSONfn v0.60.00
// Project: https://github.com/vkiryukhin/jsonfn
// Definitions by: Sal Sanfilippo <https://github.com/salsanfilippo>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

declare module 'json-fn' {
  export function clone(obj: any, date2obj?: boolean): any;
  export function stringify(obj: any): string;
  export function parse(str: string, date2obj?: boolean): any;
}
