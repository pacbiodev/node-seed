/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/body-parser/body-parser.d.ts" />
/// <reference path="../typings/cookie-parser/cookie-parser.d.ts" />
/// <reference path="../typings/errorhandler/errorhandler.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/fs-extra/fs-extra.d.ts" />
/// <reference path="../typings/method-override/method-override.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="../typings/mongoose/mongoose.d.ts" />
/// <reference path="../typings/nodemailer/nodemailer.d.ts" />
/// <reference path="../typings/winston/winston.d.ts" />

/// <reference path="../typings/lib-ext/lib-ext.d.ts" />
/// <reference path="../typings/json-fn/json-fn.d.ts" />

// Include these files
require('./includes/object.js');
require('./includes/string.js');

import BodyParser = require('body-parser');
import CookieParser = require('cookie-parser');
import Crypto = require('crypto');
import ErrorHandler = require('errorhandler');
import Express = require('express');
import Fs = require('fs-extra');
import Logger = require('winston');
import mailer = require('nodemailer');
import MethodOverride = require('method-override');
import moment = require('moment');
import Mongoose = require('mongoose');
import Path = require('path');

import jsonfn = require('json-fn');

var applicationRoot = __dirname;
var config = global['config'] = require('Konfig')({ path: '%s/config'.sprintf(applicationRoot) });

// No type definitions for these modules
var ExpressValidator = require('express-validator');
var FavIcon = require('serve-favicon');
var Hbs = require("hbs");
var MultiPart = require('connect-multiparty');
var Recaptcha = require('recaptcha').Recaptcha;

import Error = require('./error');
import Strings = require('./strings');

import ExpressExt = require('./express-ext');

Mongoose.connect('mongodb://localhost/pacbio');

var app = Express();
import routes = require('./routes/auth');
import users = require('./routes/users');

import Jwt = require('./jwt');

app.use(CookieParser());
app.use(BodyParser.json());
app.use(<Express.RequestHandler> ExpressValidator());
app.use(MethodOverride('X-HTTP-Method-Override'));

// view engine setup
app.set('views', Path.join(applicationRoot, 'views'));
app.set('view engine', 'hbs');

app.all('/*',
        (req, res, next) => {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Auth-Token');
          res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

          app.disable('etag');

          // Set full request URL
          req.headers['requestedUrl'] = '%s://%s%s'.sprintf(req.protocol,
                                                            req.get('host'),
                                                            req.originalUrl);

          next();
        });

app.use(FavIcon('%s/img/favicon.png'.sprintf(applicationRoot)));
app.use(Express.static('%s/'.sprintf(applicationRoot)));
app.use(Jwt.Utils.middleware().unless({ path: [ /^\/api\/auth\/login/,
                                                /\/api\/{0,1}$/,
                                                /^\/error\/[0-9][0-9][0-9]\/{0,1}$/] }));

// API Documentation
app.get('/api',
        (req, res, next) => {
          res.status(200)
             .render('api',
                     { title: Strings.messages['default-page-title'] });

        });

// API Routes
app.use('/api/auth', <Express.RequestHandler> routes);
app.use('/api/users', <Express.RequestHandler> users);

// Error Test
// @TODO remove
app.use('/error/:id', (req, res, next) => {
  var id = parseInt(req.params.id);

  switch (id) {
    case 400:
      throw new Error.BadRequestError();

    case 401:
      throw new Error.UnauthorizedError();

    case 403:
      throw new Error.ForbiddenError();

    case 404:
      throw new Error.PageNotFoundError();

    case 500:
      throw new Error.InternalServerErrorError();

    case 501:
      throw new Error.NotImplementedError();

    case 503:
      throw new Error.ServiceUnavailableError();

    default:
      throw new Error.ServerError(406, 'Not Acceptable', 'The resource identified by the request is not acceptable.');
  }
});

// Everything else, serve up from content folder
app.use((req, res) => {
  // Use response.sendfile, as it streams instead of reading the file into memory.
  res.sendFile('%s/public/index.html'.sprintf(applicationRoot));
});

// Catch All Error Handler
// @TODO add support to redirect to correct error pages when running in PROD or TEST
app.use(<ErrorRequestHandler> (err, req, res, next) => {
  var context = {
      status: err.status || 500,
      name: err.name || err.code || Error.strings['unknown-name'],
      message: err.message || Error.strings['unknown-message'],
      error: err.stack || String.EMPTY
    };

  res.status(context.status)
     .render('error/dev-error',
             {
               title: Error.strings['error-title']
                           .sprintf(context.status, context.name),
               class: 'error-body',
               context: context,
               showDetails: true
             });
});

Logger.info('Application initialized.');

export = app;
