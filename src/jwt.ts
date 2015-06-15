/// <reference path="../typings/express/express.d.ts" />/// <reference path="../typings/express-validator/express-validator.d.ts" />/// <reference path="../typings/async/async.d.ts" />/// <reference path="../typings/fs-extra/fs-extra.d.ts" />/// <reference path="../typings/jsonwebtoken/jsonwebtoken.d.ts" />/// <reference path="../typings/moment/moment.d.ts" />/// <reference path="../typings/winston/winston.d.ts" />/// <reference path="../typings/lib-ext/lib-ext.d.ts" />declare var config;// Include these filesrequire('./includes/object.js');require('./includes/string.js');import ExpressExt = require('./express-ext');import Express = require('express');import Fs = require('fs-extra');import Http = require('http');import JsonWebToken = require('jsonwebtoken');import Logger = require('winston');import Moment = require('moment');import Errors = require('./error');import UserModel = require('./models/user');var PATH_TO_CONFIG = '%s/config/keystore/%s';export module Utils {  var publicKey = Fs.readFileSync(PATH_TO_CONFIG.sprintf(__dirname, config.app.public_key));  var privateKey = Fs.readFileSync(PATH_TO_CONFIG.sprintf(__dirname, config.app.private_key));  export class Context {    constructor(public id:string,                public userName:string,                public email:string,                public firstName:string,                public lastName:string,                public modified:Date) {    }  }  function fetch(headers:ExpressExt.IHttpHeaders):string {    if (headers && headers.authorization) {      var authorization = headers.authorization;      var part = authorization.split(' ');      if (part.length === 2) {        var token = part[1];        return part[1];      } else {        return null;      }    } else {      return null;    }  }  export function create(context:Context):string {    Logger.debug('Create token');    if (Object.isNullOrUndefined(context))      throw new Errors.BadRequestError();    var token = null;    try {      token = JsonWebToken.sign({                                  context: context                                },                                privateKey,                                {                                  algorithm: 'RS256',                                  issuer: config.app.jwt_token_issuer,                                  subject: context.userName,                                  expiresInMinutes: (config.app.jwt_token_expiration * 60)                                });    } catch (err) {      Logger.error(err.stack);    }    Logger.debug('Token generated for user: %s, token: %s'.sprintf(context.userName, token));    return token;  }  function verify(token:string):any {    Logger.debug('Verify token');    var decoded = null;    try {      decoded = JsonWebToken.verify(token,                                    publicKey,                                    {                                      issuer: config.app.jwt_token_issuer                                    },                                    undefined); // This is a hack. The type definition file should have                                                // this parameter as option. Which means the method                                                // executes synchronously.    } catch (err) {      Logger.error(err.stack);    }    return decoded;  }  function refresh(decoded:any):string {    var expiration,        now,        newToken;    expiration = decoded.exp;    now = Moment().unix().valueOf();    if((expiration - now) < (config.app.jwt_token_refresh_expiration * 60 * 60)) {      newToken = create(decoded.context);      if(newToken) {        return newToken;      }    } else {      return null;    }  }  export function middleware() {    var func:ExpressExt.IUnless = (req:ExpressExt.IRequest,                                   res:ExpressExt.IResponse,                                   next:Function):Function => {                                    var decoded = null;                                    var err:Errors.ServerError = null;                                    var token = fetch(req.headers);                                    try {                                      decoded = verify(token);                                    } catch (e) {                                       err = e;                                    }                                    if ((err) || (decoded==null)) {                                      if (err)                                        Logger.error(err.stack);                                      req.user = undefined;                                      err = new Errors.UnauthorizedError();                                      res.status(err.status)                                         .json(err);                                      return null;                                    } else {                                      // Slide the token expiration                                      var newToken = refresh(decoded);                                      if (newToken) {                                        res.headers.authorization = newToken;                                      }                                      req.user = Object.merge(req.user, decoded.context);                                      return next();                                    }                                  };    func.unless = <ExpressExt.IUnless> require('express-unless');    return func;  }}