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

Player.prototype.movePaddle = function(yCoord1,yCoord2) {
  this.paddle1.y = yCoord1;
  this.paddle2.y = yCoord2;
}


var socket = io.connect(window.location.origin);
var y = 0;

socket.on('controls', function (data) {
  console.log(data);
  if (data["playerNumber"] == "1"){
	y1 = data["mouseY"];
  } else if (data["playerNumber"] == "2"){
	y2 = data["mouseY"];
  }
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

  var paddle1 = document.getElementById("player1");
  var paddle2 = document.getElementById("player2");
  var paddle1DOMElement = new createjs.DOMElement(paddle1);
  var paddle2DOMElement = new createjs.DOMElement(paddle2);
	player = new Player(paddle1DOMElement);

	//add the paddle to the stage.
  stage.addChild(paddle1DOMElement);

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
  player.movePaddle(y1,y2);
	stage.update();
}