var socket = io.connect(window.location.origin);
var y = 0;
// game related code
var first = false;
var paddleStartY;

socket.on('controls', function (data) {
  console.log(data);
  y = data["mouseY"];
});
//EaselJS Stage instance that wraps the Canvas element
var stage;

//EaselJS Shape instance that we will animate
var rectangle;

//radius of the paddle Graphics that we will draw.
var PADDLE_WIDTH = 5;
var PADDLE_HEIGHT = 25;

//x position that we will reset Shape to when it goes off
//screen
var paddleXreset;
var paddleYreset;

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

	//Create an EaselJS Graphics element to create the
	//commands to draw a paddle
	var g = new createjs.Graphics();

	//stroke of 1 px
	g.setStrokeStyle(1);

	//Set the stroke color, using the EaselJS 
	//Graphics.getRGB static method.
	//This creates a white color
	g.beginFill(createjs.Graphics.getRGB(255,255,255,1));

	//draw the paddle
	//g.drawCircle(0,0, CIRCLE_RADIUS);
  g.rect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);

	//note that the paddle has not been drawn yet. 
	//the Graphics instance just has the commands to
	//draw the paddle.
	//It will be drawn when the stage needs to render it
	//which is usually when we call stage.tick()

	//create a new Shape instance. This is a DisplayObject
	//which can be added directly to the stage (and rendered).
	//Pass in the Graphics instance that we created, and that
	//we want the Shape to draw.
	rectangle = new createjs.Shape(g);

	//set the initial x position, and the reset position
	rectangle.x = rectangleYReset = 0;

	//set the y position
	rectangle.y = canvas.height / 2;

	//add the paddle to the stage.
	stage.addChild(rectangle);

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
	//check and see if the Shape has gone of the right
	//of the stage.
	/*
if (first) {
	  paddleStartY = y;
	  first = false;
	} else {
*/
	  rectangle.y = y;
  //}
	//re-render the stage
	stage.update();
}