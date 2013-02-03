/*
 * Player class
 */
function Player(paddle) {
  this.paddle = paddle;
  this.middleY;
  this.calibrated = false;
  this.score = 0;
}

Player.prototype.calibrate = function(yCoord) { 
  this.middleY = yCoord;
  this.calibrated = true;
};

Player.prototype.movePaddle = function(yCoord) {
  this.paddle.y = yCoord;
}


var socket = io.connect(window.location.origin);
var y = 0;

socket.on('controls', function (data) {
  console.log(data);
  y = data["mouseY"];
});
//EaselJS Stage instance that wraps the Canvas element
var stage;

//EaselJS Shape instance that we will animate
var rectangle;
var player;

//EaselJS Rectangle instance we will use to store the bounds
//of the Canvas
var bounds;

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

	//copy the canvas bounds to the bounds instance.
	//Note, if we resize the canvas, we need to reset
	//these bounds.
	bounds = new createjs.Rectangle();
	bounds.width = canvas.width;
	bounds.height = canvas.height;

	//pass the canvas element to the EaselJS Stage instance
	//The Stage class abstracts away the Canvas element and
	//is the root level display container for display elements.
	stage = new createjs.Stage(canvas);

  var paddle = document.getElementById("player1");
  var paddleDOMElement = new createjs.DOMElement(paddle);
	player = new Player(paddleDOMElement);

	//add the paddle to the stage.
  stage.addChild(paddleDOMElement);

	//tell the stage to render to the canvas
	stage.update();

	createjs.Ticker.setFPS(24);

	//Subscribe to the Tick class. This will call the tick
	//method at a set interval (similar to ENTER_FRAME with
	//the Flash Player)
	createjs.Ticker.addListener(this);
}

//function called by the Tick instance at a set interval
function tick()
{
  player.movePaddle(y);
	stage.update();
}