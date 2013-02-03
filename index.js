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
app.roomData = new Array();
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
    res.render('mousetest_requestroom');
  });
  
  app.get('/mouse/lobby/:room', function(req, res) {
    res.render('mousetest_lobby');
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
      
      var playerSockets = app.playerSockets;
      var roomData = app.roomData;
      
      socket.on('handshake', function (data){
        // This should actually check whether or not the room is valid, but whatever.
        if (data.page === "lobby") {
          var numPlayers = 0;
          if (data.game === "pong") {
            numPlayers = 2;
          } else if (data.game === "mouse") {
            numPlayers = 1;
          }
          
          playerSockets[data.room] = new Array();
          roomData[data.room] = { socket: socket, game: data.game, numPlayers: numPlayers };
          console.log(roomData);
          socket.join("room" + data.room);
          socket.emit('handshake', { numberControllers: numPlayers });
        } else if (data.page === "mobile") {
          if (roomData[data.room] !== undefined) {
            if (playerSockets[data.room][data.playerNumber] !== undefined) {
              playerSockets[data.room][data.playerNumber].disconnect();
            }
            playerSockets[data.room][data.playerNumber] = socket;
            socket.join("room" + data.room);
            socket.emit('handshake', { hello: "world" });
            
            socket.on('controller', (function(num) {
              return function(data){
                app.roomData[num].socket.emit('controls', data);
              };
            })(data.room));
            
            var allConnected = true;
            for (var i = 1; i <= roomData[data.room].numPlayers; ++i) {
              if (playerSockets[data.room][i] === undefined) {
                allConnected = false;
                break;
              }
            }
            if (allConnected) {
              roomData[data.room].socket.emit('playersready', { hello: "world" });
            }
          } else {
            socket.disconnect();
          }
        } else if (data.page === "screen") {
          if (roomData[data.room] !== undefined) {
            roomData[data.room].socket = socket;
            socket.join("room" + data.room);
            socket.emit('handshake', { hello: "world" });
            
            socket.on('disconnect', (function(num) {
              return function() {
                for (var i = 1; i <= roomData[data.room].numPlayers; ++i) {
                  if (playerSockets[data.room][i] !== undefined) {
                    playerSockets[data.room][i].disconnect();
                  }
                }
              };
            })(data.room));
          } else {
            socket.disconnect();
          }
        }
        
      });
      
      socket.on('requestroom', function (data){
        socket.emit('assignroom', { room: app.roomNumber })
      });
      
    });
    return server;
  }
  return app;
}


module.exports = parsnip;
