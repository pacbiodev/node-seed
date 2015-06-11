/// <reference path="../typings/express/express.d.ts" />

export interface IUnless extends Function {
  unless?:Function;
}

export interface IHttpHeaders {
  authorization:string;
  requestedUrl:string;
}

export interface IRequest {
  headers:IHttpHeaders;
  originalUrl:string;
  user:Object;
}

export interface IResponse {
  status(statusCode:number):IResponse;
  send():IResponse;
  json(object:any):IResponse;
  headers:IHttpHeaders;
}

export interface Express {
  Unless:IUnless;
  HttpHeaders:IHttpHeaders;
  Request:IRequest;
  Response:IResponse;
}
