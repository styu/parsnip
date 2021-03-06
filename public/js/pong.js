function calculateAngleY(player, ball) {
  return 2 * ((ball.ball.y - player.paddle.y) / 25.0);
}

function calculateAngleX(player, ball) {
  return 2 * ((ball.ball.x - player.paddle.x) / 25.0);
}
/*
 * Game class
 */
function Game(players, ball) {
  this.players = players;
  this.ball = ball;
}

Game.prototype.makeMove = function(values) {
  for (var i = 0; i < this.players.length; i++) {
    if (i < 2) {
      this.players[i].movePaddleY(values[i]);
    } else {
      this.players[i].movePaddleX(values[i]);
    }
  }
  this.ball.moveBall();
}

Game.prototype.checkForCollisionY = function() {
  if (this.players[0].isTouchingY(this.ball)) {
    if (this.ball.speedX < 0) {
      this.ball.speedX *= -1;
      this.ball.speedY = calculateAngleY(this.players[0], this.ball);
    }
  } else if (this.players[1].isTouchingY(this.ball)) {
    if (this.ball.speedX > 0) {
      this.ball.speedX *= -1;
      this.ball.speedY = calculateAngleY(this.players[1], this.ball);
    }
  }
}

Game.prototype.checkForCollisionX = function() {
  if (this.players[2].isTouchingX(this.ball)) {
    if (this.ball.speedY < 0) {
      this.ball.speedY *= -1;
      this.ball.speedX = calculateAngleX(this.players[2], this.ball);
    }
  } else if (this.players[3].isTouchingX(this.ball)) {
    if (this.ball.speedY > 0) {
      this.ball.speedY *= -1;
      this.ball.speedX = calculateAngleX(this.players[3], this.ball);
    }
  }
}

/*
 * Player class
 */
function Player(paddle, element) {
  this.paddle = paddle;
  this.score = 0;
  this.element = element;
  this.height = element.style.height;
  this.midHeight = this.height / 2;
}

/*
 * Moves the paddle by setting the y coordinate, calibrated
 * beforehand
 */
Player.prototype.movePaddleY = function(yCoord) {
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
 * Moves the paddle by setting the y coordinate, calibrated
 * beforehand
 */
Player.prototype.movePaddleX = function(xCoord) {
  if (xCoord <= 0) {
    this.paddle.x = 0;
  } else if (xCoord >= $(document).width() - 120) {
    this.paddle.x = $(document).width() - this.width;
  } else {
    this.paddle.x = xCoord;
  }
};

/*
 * Returns true if the given object is touching the player
 */
Player.prototype.isTouchingY = function(pingpongball) {
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
 * Returns true if the given object is touching the player
 */
Player.prototype.isTouchingX = function(pingpongball) {
  if (pingpongball.ball.y <= pingpongball.radius - $(window).height() / 2 + 65){
    if (pingpongball.ball.x > this.paddle.x && pingpongball.ball.x < (this.paddle.x + 120)){
      return true;
    }
  } else if (pingpongball.ball.y >= $(window).height() / 2 - pingpongball.radius - 65) {
    if (pingpongball.ball.x > this.paddle.x && pingpongball.ball.x < (this.paddle.x + 120)){
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
var values = new Array(),
    player1, player2, player3, player4,
    pingpongball,
    game;

	var tokens = document.URL.split("/");
  var room = parseInt(tokens[tokens.length-1]);
	
	socket.on('connect', function() {
    socket.emit('handshake', { room: room, page: "screen" });
  });
		
socket.on('controls', function (data) {
  if (data["playerNumber"] === 1) {
    if (data["mouseY"] !== undefined) {
      values[0] = data["mouseY"];
    } else {
      values[0] = h * ((data["agY"] + 5) / 10);
    }
  } else if (data["playerNumber"] === 2) {
    if (data["mouseY"] !== undefined) {
      values[1] = data["mouseY"];
    } else {
      values[1] = h * ((data["agY"] + 5) / 10);
    }
  } else if (data["playerNumber"] === 3) {
    if (data["mouseX"] !== undefined) {
      values[2] = data["mouseX"];
    } else {
      values[2] = h * ((data["agX"] + 5) / 10);
    }
  } else if (data["playerNumber"] === 4) {
    if (data["mouseX"] !== undefined) {
      values[3] = data["mouseX"];
    } else {
      values[3] = h * ((data["agX"] + 5) / 10);
    }
  }
});

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
	var players = [player1, player2];
	pingpongball = new Ball(ballDOMElement, ball);
  game = new Game(players, pingpongball);

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

//initialize function, called when page loads.
function init4()
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
      paddle3 = document.getElementById("player3"),
      paddle4 = document.getElementById("player4"),
      ball = document.getElementById("ball"),
      paddle1DOMElement = new createjs.DOMElement(paddle1),
      paddle2DOMElement = new createjs.DOMElement(paddle2),
      paddle3DOMElement = new createjs.DOMElement(paddle3),
      paddle4DOMElement = new createjs.DOMElement(paddle4),
      ballDOMElement = new createjs.DOMElement(ball);

	player1 = new Player(paddle1DOMElement, paddle1);
	player2 = new Player(paddle2DOMElement, paddle2);
	player3 = new Player(paddle3DOMElement, paddle3);
	player4 = new Player(paddle4DOMElement, paddle4);
	var players = [player1, player2, player3, player4];
	pingpongball = new Ball(ballDOMElement, ball);
  game = new Game(players, pingpongball);

	//add the paddles to the stage.
  stage.addChild(paddle1DOMElement);
  stage.addChild(paddle2DOMElement);
  stage.addChild(paddle3DOMElement);
  stage.addChild(paddle4DOMElement);
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
  game.makeMove(values);
  game.checkForCollisionY();
  if (game.players.length > 2) {
    game.checkForCollisionX();
  }
	stage.update();
}