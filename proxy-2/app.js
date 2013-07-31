/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

require('nodefly').profile(
    '8cd1e6b02b449a3cb474a4265cb368e5', 'mote.io');

var
  path = require('path'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Account = require('./models/account'),
  url = require('url'),
  servers = [],
  http = require('http'),
  httpProxy = require('http-proxy'),
  fs = require('fs'),
  express = require('express'),
  config = {},
  proxy = new httpProxy.RoutingProxy()

var loggly = require('loggly');
var config = {
  json: true,
  subdomain: "moteioo",
    auth: {
      username: "moteio",
      password: "CUTh&5R7B:BVe@i"
    }
  };

var client = loggly.createClient(config);

var app = express();

app.configure(function() {

  app.use(express.errorHandler());

  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser());
  app.use(app.router);

});

app.get('/get/private/servers', function(req, res, next){

  if(req.query.key == "udL6Qn<fK!3IMqP5<GAR6m9naW3DTvOQUiKnW1E6br7Z65I3R8C5Km140vMEBN3x2I3ad1Yc1gBOWGR") {

    // this is really insecure
    if(req.query.server_notice == "online") {
      servers.push(req.query.server)
    }

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(JSON.stringify({success: true}));
    res.end();

  } else {

    res.writeHead(400, {"Content-Type": "text/plain"});
    res.write("400 Not Authorized\n");
    res.end();

  }

});

app.get('/post/login', function(req, res, next) {

  // when the user authenticates (if the path is login)
  // do a bouncer lookup
  // and store a cookie with the header
  // var myDate = new Date();
  // myDate.setDate(myDate.getDate()+365 * 25);
  // cookies.set('load.io-id', 12, {expires: myDate})
  // on all other requests, look for that cookie

  console.log(req.query.user)

  Account.findById(req.query.user, function(err,user){

    console.log(res)

    if(err) {

      err.type = 'error';
      err.source = 'proxy-username';
      console.log('cb-error')
      console.log(err)
      res.send

    } else {

      console.log(user);
      console.log('^^^^ user');
      var server = bouncer(user);
      console.log(server)

      if(server) {
        console.log('sent to server')
        console.log(server)
        req.headers['mod-servo'] = server;
      }


    }

  });

  res.send(200);

});

app.get('*', function(req, res) {

  console.log('request')

  req.headers.host = 'moteio-7506.onmodulus.net';
  proxy.proxyRequest(req, res, {
    target: {
      host: 'moteio-7506.onmodulus.net',
      port: 80
    }
  });

})

var server = http.createServer(app);
server.listen(3002);

