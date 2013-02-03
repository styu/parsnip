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
app.roomNumber = 0;
app.playerSockets = new Array();

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
  
  app.get('/mouse', function(req, res) {
    app.roomNumber++;
    res.render('mousetest');
  });
  
  app.get('/mouse/:room', function(req, res) {
    res.render('mousetest');
  });
  
  app.get('/m/mouse/:room/:num', function(req, res) {
    res.render('mousetest_mobile');
  });
  
  app.get('/m/:num', function(req, res) {
    console.log("player " + req.params.num + "connected");
    res.render('mousetest_mobile');
  });
  
  app.get('/qr', function(req, res) {
    res.render('qrtest');
  });
  
  app.get('/pointer', function(req, res) {
    res.render('pointer');
  });
  
  var express_listen = app.listen;
  
  app.listen = function(port, callback) {
    var server = express_listen.call(app, port, callback);
    app.io = SocketIO.listen(server);
    app.io.sockets.on('connection', function(socket) {
      app.connectedPlayers++;
      
      socket.on('handshake', function (data){
        // This should actually check whether or not the room is valid, but whatever.
        if (data.page === "lobby") {
          if (data.game === "pong") {
            playerSockets[data.room] = new Array();
            socket.emit('handshake', { numberControllers: 2 });
          }
        } else if (data.page === "mobile") {
          if (playerSockets[data.room][data.playerNumber] !== undefined) {
            playerSockets[data.room][data.playerNumber].disconnect();
          }
          playerSockets[data.room][data.playerNumber] = socket;
          
        } else if (data.page === "screen") {
          //
        }
        
      });
      
      socket.on('requestroom', function (data){
        socket.emit('assignroom', { room: app.roomNumber })
      });
      
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
