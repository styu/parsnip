function calculateAngle(player, ball) {
  return 2 * ((ball.ball.y - player.paddle.y) / 25.0);
}

/*
 * Game class
 */
function Game(player1, player2, ball) {
  this.player1 = player1;
  this.player2 = player2;
  this.ball = ball;
}

Game.prototype.makeMove = function(y1, y2) {
  this.player1.movePaddle(y1);
  this.player2.movePaddle(y2);
  this.ball.moveBall();
}

Game.prototype.checkForCollision = function() {
  if (this.player1.isTouching(this.ball)) {
    if (this.ball.speedX < 0) {
      this.ball.speedX *= -1;
      this.ball.speedY = calculateAngle(this.player1, this.ball);
    }
  } else if (this.player2.isTouching(this.ball)) {
    if (this.ball.speedX > 0) {
      this.ball.speedX *= -1;
      this.ball.speedY = calculateAngle(this.player2, this.ball);
    }
  }
}

/*
 * Player class
 */
function Player(paddle, element) {
  this.paddle = paddle;
  this.middleY;
  this.calibrated = false;
  this.score = 0;
  this.element = element;
  this.height = element.style.height;
  this.midHeight = this.height / 2;
}

/*
 * Sets the first position of the position as the 'middle'
 * of the pong game, such that all movements are relative
 * from the phone position
 */
Player.prototype.calibrate = function(yCoord) { 
  this.middleY = yCoord;
  this.calibrated = true;
};

/*
 * Moves the paddle by setting the y coordinate, calibrated
 * beforehand
 */
Player.prototype.movePaddle = function(yCoord) {
  if (yCoord <= 0) {
    this.paddle.y = 0;
  } else if (yCoord >= $(document).height() - 120) {
    console.log('too down' + yCoord);
    this.paddle.y = $(document).height() - this.height;
  } else {
    this.paddle.y = yCoord;
  }
};

/*
 * Returns true if the given object is touching the player
 */
Player.prototype.isTouching = function(pingpongball) {
  if (pingpongball.ball.x <= pingpongball.radius - $(window).width() / 2 + 65){
    if (pingpongball.ball.y > this.paddle.y && pingpongball.ball.y < (this.paddle.y + 120)){
      return true;
    }
  } else if (pingpongball.ball.x >= $(window).width() / 2 - pingpongball.radius - 65) {
    if (pingpongball.ball.y > this.paddle.y && pingpongball.ball.y < (this.paddle.y + 120)){
      return true;
    }
  }
  return false;
};

/*
 * Ball class
 */
function Ball(ball, element) {
  this.ball = ball;
  this.angle;
  this.scale = 150;
  this.defaultSpeedX = -$(window).width() / this.scale;
  this.defaultSpeedY = -$(window).height() / this.scale;
  this.speedX = this.defaultSpeedX;
  this.speedY = this.defaultSpeedY;
  this.element = element;
  this.radius = this.element.style.height / 2;
}

Ball.prototype.moveBall = function() {
  this.ball.x += this.speedX;
  this.ball.y += this.speedY;

  //first check the left and right boundaries
  if (this.ball.x <= - $(window).width() / 2){
    this.ball.x = 0;
    this.ball.y = 0;
    this.speedX = this.defaultSpeedX;
    this.speedY = this.defaultSpeedY;
  } else if (this.ball.x >= $(window).width() / 2) { 
    this.ball.x = 0;
    this.ball.y = 0;
    this.speedX = this.defaultSpeedX;
    this.speedY = this.defaultSpeedY;
  }

  //now we do the same with the top and bottom of the screen
  if (this.ball.y <= 0){
    this.ball.y = 0;
    this.speedY *= -1;
  } else if (this.ball.y >= $(window).height() - this.element.style.height) {
    this.ball.y = $(window).height() - this.element.style.height;
    this.speedY *= -1;
  }
};

var socket = io.connect(window.location.origin);

//EaselJS Stage instance that wraps the Canvas element
var stage;
var h = $(window).height(),
    w = $(window).width();
var y1 = 0, y2 = 0,
    player1, player2,
    pingpongball,
    game;

	var tokens = document.URL.split("/");
  var room = parseInt(tokens[tokens.length-1]);
	
	socket.on('connect', function() {
    socket.emit('handshake', { room: room, page: "screen" });
  });
		
socket.on('controls', function (data) {
  //console.log(data);
  if (data["playerNumber"] === 1) {
    //y1 = data["agY"];
    y1 = h * ((data["agY"] + 5) / 10);
    if (!player1.calibrated) {
      player1.calibrate(y1);
    }
  } else if (data["playerNumber"] === 2) {
    //y2 = data["agY"];
    y2 = h * ((data["agY"] + 5) / 10);
    if (!player2.calibrated) {
      player2.calibrate(y2);
    }
  }
});

//initialize function, called when page loads.
function init()
{
	//check and see if the canvas element is supported in
	//the current browser
	//http://diveintohtml5.org/detect.html#canvas
	if(!(!!document.createElement('canvas').getContext))
	{
		var wrapper = document.getElementById("canvasWrapper");
		wrapper.innerHTML = "Your browser does not appear to support " +
		"the HTML5 Canvas element";
		return;
	}

	//get a reference to the canvas element
	var canvas = document.getElementById("gameBoard");

	//pass the canvas element to the EaselJS Stage instance
	//The Stage class abstracts away the Canvas element and
	//is the root level display container for display elements.
	stage = new createjs.Stage(canvas);

  var paddle1 = document.getElementById("player1"),
      paddle2 = document.getElementById("player2"),
      ball = document.getElementById("ball"),
      paddle1DOMElement = new createjs.DOMElement(paddle1),
      paddle2DOMElement = new createjs.DOMElement(paddle2),
      ballDOMElement = new createjs.DOMElement(ball);

	player1 = new Player(paddle1DOMElement, paddle1);
	player2 = new Player(paddle2DOMElement, paddle2);
	pingpongball = new Ball(ballDOMElement, ball);
  game = new Game(player1, player2, pingpongball);

	//add the paddles to the stage.
  stage.addChild(paddle1DOMElement);
  stage.addChild(paddle2DOMElement);
  stage.addChild(ballDOMElement);

	//tell the stage to render to the canvas
	stage.update();

	createjs.Ticker.setFPS(60);

	//Subscribe to the Tick class. This will call the tick
	//method at a set interval (similar to ENTER_FRAME with
	//the Flash Player)
	createjs.Ticker.addListener(this);
}

//function called by the Tick instance at a set interval
function tick()
{
  game.makeMove(y1, y2);
  game.checkForCollision();
	stage.update();
}