/// <reference path="../../typings/node/node.d.ts" />/// <reference path="../../typings/async/async.d.ts" />/// <reference path="../../typings/express/express.d.ts" />/// <reference path="../../typings/express-validator/express-validator.d.ts" />/// <reference path="../../typings/fs-extra/fs-extra.d.ts" />/// <reference path="../../typings/winston/winston.d.ts" />/// <reference path="../../typings/lib-ext/lib-ext.d.ts" />// Include these filesrequire('../includes/object');require('../includes/string.js');import Async = require('async');import Errors = require('../error');import Express = require('express');import ExpressValidator = require('express-validator');import Fs = require('fs-extra');import Jwt = require('../jwt');import UserModel = require('../models/user');var BCrypt = require('bcryptjs');var Ldap = require('ldapjs');var Logger = require('winston');var Moment = require('moment');var Context = Jwt.Utils.Context;Ldap.Attribute.settings.guid_format = Ldap.GUID_FORMAT_B;declare var config;export module Controller {  export function login(userName:string,                        password:string,                        callback:Function) {    var isAuthenticated = false;    var user = null;    Async.series([(done:Function) => {                  ldapLogin(userName,                            password,                            (err:Error, ldapUser:Object) => {                              user = ldapUser;                              isAuthenticated = (user!=null);                              done();                            });                  },                  (done:Function) => {                    if (!isAuthenticated) {                      cachedLogin(userName,                                  password,                                  (err:Error, token:string, cachedUser:Jwt.Utils.Context) => {                                    if (token && cachedUser) {                                      var token = Jwt.Utils.create(cachedUser);                                      callback({ status: 200, content: { token: token, user: cachedUser } });                                    } else {                                      callback({ status: 400, content: err });                                    }                                    done();                                  })                    } else {                      updateCachedLogin(user,                                        password,                                        (err:Error, token:string, cachedUser:Jwt.Utils.Context) => {                                          if (token && cachedUser) {                                            var token = Jwt.Utils.create(cachedUser);                                            callback({ status: 200, content: { token: token, user: cachedUser } });                                          } else {                                            callback({ status: 400, content: err });                                          }                                          done();                                        });                    }                  }]);  }  export function ldapLogin(userName:string,                            password:string,                            callback:Function):void {    Logger.info('Logging in using LDAP.');    var client = Ldap.createClient({ url: 'ldap://%s:%d'.sprintf(config.app.ldap_hostname,                                                                 config.app.ldap_port) });    var options = {      filter: '(sAMAccountName=' + userName + ')',      scope: 'sub',      attributes: [ 'cn',                    'objectGUID',                    'displayName',                    'givenName',                    'mail',                    'sAMAccountName',                    'sn' ]    };    var user;    // Lookup user by Sam Account    client.search('CN=Users,DC=Nanofluidics,DC=com',                  options,                  (err, search) => {                    if (err) {                      Logger.error(err.stack);                      return callback(err, null);                    } else {                      search.on('searchEntry',                                (entry) => {                                  user = entry.object;                                  user.userName = user.sAMAccountName;                                  Logger.info('%s\n%s', user.sAMAccountName, user.objectGUID);                                });                      search.on('error',                        (err) => {                          Logger.error(err.stack);                          return callback(err, null);                        });                      search.on('end',                                (result) => {                                  Logger.info('Result: %s', result.status);                                  if (user != null)                                    client.bind(user.cn,                                                password,                                                (err) => {                                                  client.unbind((unbindErr) => {                                                                  if (unbindErr) {                                                                    Logger.error('Non fatal error while unbinding LDAP.');                                                                  }                                                                });                                                  if (err) {                                                    user = null;                                                    if (err.name === 'InvalidCredentialsError') {                                                      err = new Errors.InvalidCredentialsError();                                                    }                                                  }                                                  callback(err, user);                                                });                                });                    }      });  }  export function cachedLogin(userName:string,                              password:string,                              callback:Function) {    Logger.info('Falling back to loging in using cached users.');    UserModel.User             .findOne({ userName: userName },                      (err:Error, user:UserModel.IUser) => {                        var token = null,                            context = null;                        if (!user) {                          err = new Errors.InvalidCredentialsError();                        } else {                          if (!BCrypt.compareSync(password,                                                  user.password)) {                            err = new Errors.InvalidCredentialsError();                          } else {                            context = new Context(user._id,                                                  user.userName,                                                  user.email,                                                  user.firstName,                                                  user.lastName,                                                  user.modified);                            token = Jwt.Utils.create(context);                          }                        }                        callback(err, token, context);                      });  }  export function updateCachedLogin(ldapUser:any,                                    password:string,                                    callback:Function):void {    Logger.info('Updating cached login.');    // Authenticated with LDAP, update local user store    UserModel.User             .findOneAndUpdate({                                 userName: ldapUser.sAMAccountName                               }, {                                 userName: ldapUser.sAMAccountName,                                 email: ldapUser.mail || String.EMPTY,                                 password: BCrypt.hashSync(password, 10),                                 firstName: ldapUser.givenName,                                 lastName: ldapUser.sn,                                 modified: new Date()                               }, {                                 upsert: true                               },                               (err:any, user:UserModel.IUser) => {                                 if (err) {                                   Logger.error(err.stack);                                 }                                 var token:string = null,                                     context = null;                                 if (user) {                                   context = new Context(user._id,                                                         user.userName,                                                         user.email,                                                         user.firstName,                                                         user.lastName,                                                         user.modified);                                   token = Jwt.Utils.create(context);                                 }                                 callback(err, token, context);                               });  }  export function getUsers(req, res) {    UserModel.User             .find({},                   (err:any, users:Array<UserModel.IUser>) => {                     if (err) {                      Logger.error(err.stack);                      res.status(400)                        .json(err.stack);                     } else {                      res.status(200)                        .json(users || [ ]);                     }                   });  }  export function getUser(req, res) {    UserModel.User             .findById(req.params.id,                       'userName email firstName lastName modified',                       (err:any, user:UserModel.IUser) => {                         if (err) {                           Logger.error(err.stack);                           res.status(400)                              .json(err.stack);                         } else {                           // TODO: Hack, need to get mongoose instance methods working                           user['_doc'].id = user._id;                           delete user['_doc']._id;                           res.status(200)                              .json(user);                         }                       });  }  export function userExists(user:UserModel.IUser,                             data:Object,                             callback:Function):void {  }}