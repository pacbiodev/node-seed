/// <reference path="../node/node.d.ts" />
/// <reference path="../express/express.d.ts" />

declare module "express-validator" {
  import Express = require('express');

  function e(options?:any):Function;

  module e {
    export interface Check {
      len(min:number, max?:number):Check;
      isAlpha():Check;
      isEmail():Check;
      isInt():Check;
      notEmpty():Check;
    }

    export interface Request extends Express.Request {
      check(param:string, message: string):Check;
      checkBody(param:string, message: string):Check;
      checkParams(param:string, message: string):Check;
      checkQuery(param:string, message: string):Check;
      validationErrors(asMapped?:boolean):string[];
    }
  }

  export = e;
}

