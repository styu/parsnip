  var socket = io.connect(window.location.origin);
  var timeStamp = (new Date()).getTime();
  var tokens = document.URL.split("/");
  var playerNumber = -1;
  
  var ondevicemotion_event = {};
  var onmousemove_event = {};
  
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
                      accelX: ondevicemotion_event.accelerationIncludingGravity.x,
                      accelY: ondevicemotion_event.accelerationIncludingGravity.y,
                      accelZ: ondevicemotion_event.accelerationIncludingGravity.z });
      }
      
      timeStamp = (new Date()).getTime();
    }
  }
  
  socket.on('handshake', function (data) {
    playerNumber = parseInt(tokens[tokens.length-1]);
    $("#playerNum").text(playerNumber);
  });
  
  setInterval(transmitdata,15);

  window.ondevicemotion = function(event) {  
    ondevicemotion_event = event;
  }
  
  window.onmousemove = function(event) {
    onmousemove_event = event;
  }