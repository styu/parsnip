  var socket = io.connect(window.location.origin);
  var timeStamp = (new Date()).getTime();
  var tokens = document.URL.split("/");
  var room = -1;
  var playerNumber = -1;
  var interval = -1;
  
  var ondevicemotion_event = {};
  var onmousemove_event = {};
  var odm_velocity = { x:0, y:0, z:0 };
  
  transmitdata = function(){
    // Wait until player number has been recieved
    if (playerNumber > 0) {
      if (onmousemove_event.timeStamp !== undefined && onmousemove_event.timeStamp > timeStamp) {
        socket.emit('controller',
                    { playerNumber: playerNumber,
                      timeStamp: onmousemove_event.timeStamp,
                      mouseX: onmousemove_event.pageX,
                      mouseY: onmousemove_event.pageY });
      }
      if (ondevicemotion_event.timeStamp !== undefined && ondevicemotion_event.timeStamp > timeStamp) {
        socket.emit('controller',
                    { playerNumber: playerNumber,
                      timeStamp: ondevicemotion_event.timeStamp,
                      accelX: ondevicemotion_event.acceleration.x,
                      accelY: ondevicemotion_event.acceleration.y,
                      accelZ: ondevicemotion_event.acceleration.z });
      }
      
      timeStamp = (new Date()).getTime();
    }
  }
  
  socket.on('connect', function() {
    playerNumber = parseInt(tokens[tokens.length-1]);
    room = parseInt(tokens[tokens.length-2]);
    socket.emit('handshake', { page: "mobile", room: room, playerNumber: playerNumber });
  });
  socket.on('disconnect', function() {
    if (interval !== -1) {
      clearInterval(interval);
    }
    $("#playerNum").text("?");
  });
  
  socket.on('handshake', function (data) {
    interval = setInterval(transmitdata,15);
    $("#playerNum").text(playerNumber);
  });
  
  

  window.ondevicemotion = function(event) {
    ondevicemotion_event = event;
  }
  
  window.onmousemove = function(event) {
    onmousemove_event = event;
  }
