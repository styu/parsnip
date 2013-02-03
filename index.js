var Consolidate = require('consolidate');
var Express = require('express');
var Path = require('path');
var SocketIO = require('socket.io');

var app = Express();
app.games = {};
app.socketToGame = {};
app.actions = {};
app.beginMsg = {};
// How many players have connected
app.connectedPlayers = 0;

function parsnip() {
  app.configure(function() {
    app.use(Express.json());
    app.use(Express.static(Path.join(__dirname, 'public')));
    app.engine('html', Consolidate.handlebars);
    app.set('views', Path.join(__dirname, 'views'));
    app.set('view engine', 'html');
  });
  
  //app.get('/', function(req, res) {
  //  res.render('index');
  //});
  
  app.get('/pong', function(req, res) {
    res.render('pong');
  });
  
  //app.get('/m', function(req, res) {
  //  res.render('mobile');
  //});
  
  app.get('/', function(req, res) {
    res.render('mousetest');
  });
  
  app.get('/m/:num', function(req, res) {
    console.log("player " + req.params.num + "connected");
    res.render('mousetest_mobile');
  });
  
  app.get('/qr', function(req, res) {
    res.render('qrtest');
  });
  var express_listen = app.listen;
  
  app.listen = function(port, callback) {
    var server = express_listen.call(app, port, callback);
    app.io = SocketIO.listen(server);
    app.io.sockets.on('connection', function(socket) {
      app.connectedPlayers++;
      
      //Run things when connect
      socket.emit('handshake', { hello: "world" });
      
      socket.on('controller', function(data){
        //console.log(data);
        socket.broadcast.emit('controls', data);
      });
      
    });
    return server;
  }
  return app;
}


module.exports = parsnip;
