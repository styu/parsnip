  var socket = io.connect(window.location.origin);
  var timeStamp = (new Date()).getTime();
  var tokens = document.URL.split("/");
  var room = -1;
  var playerNumber = -1;
  var interval = -1;
  
  var lastSentTimeStamp = -1;
  
  var transmitting = false;
  
  socket.on('connect', function() {
    playerNumber = parseInt(tokens[tokens.length-1]);
    room = parseInt(tokens[tokens.length-2]);
    socket.emit('handshake', { page: "mobile", room: room, playerNumber: playerNumber });
  });
  socket.on('disconnect', function() {
    transmitting = false;
    $("#playerNum").text("?");
  });
  
  socket.on('handshake', function (data) {
    transmitting = true;
    $("#playerNum").text(playerNumber);
  });
  
  truncate = function(num) {
    if (num < 0.0) {
      return Math.ceil(num);
    } else {
      return Math.floor(num);
    }
  }

  var notAccelTime = 0;
  
  window.ondevicemotion = function(event) {
    if (transmitting && event.timeStamp - lastSentTimeStamp > 30) {
      socket.emit('controller',
                    { playerNumber: playerNumber,
                      timeStamp: event.timeStamp,
                      accelX: event.acceleration.x,
                      accelY: event.acceleration.y,
                      accelZ: event.acceleration.z });
      lastSentTimeStamp = event.timeStamp;
    }
  }
  
  window.onmousemove = function(event) {
    if (transmitting && event.timeStamp - lastSentTimeStamp > 30) {
      socket.emit('controller',
                    { playerNumber: playerNumber,
                      timeStamp: event.timeStamp,
                      mouseX: event.pageX,
                      mouseY: event.pageY });
      lastSentTimeStamp = event.timeStamp;
    }
  }
