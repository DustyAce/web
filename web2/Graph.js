import {Point} from './Point.js';
import {config} from './config.js'

let canvas;
let c;
let w;
let h;

let yR;
let yMinR;
let xR;
let xMinR;
let cent;

export function initializeGraph(canvasRef) {
	canvas = canvasRef;
	c = canvas.getContext("2d");
	setBaseValues();
}


export function drawGraphWithShape() {
	c.clearRect(0,0,w,h);
	drawCoolShape();
	drawAxes();
	drawMarks();
}

export function drawEmptyGraph() {
	c.clearRect(0,0,w,h);
	drawAxes();
	drawMarks();
}

export function drawAHitPoint(point, isHit, size) {
	c.fillStyle = isHit ? "#006600" : "#660000";
	c.fillRect(point.x-size/2, point.y-size/2, size,size);
	drawAxes();
	drawMarks();
}

function drawLine(x1, y1, x2, y2) {
	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.stroke();
	c.closePath();
}

function drawCoolShape() {
	c.fillStyle = config.canvas.shapeColor;

	c.beginPath();
	c.moveTo(yMinR.x, yMinR.y);
	c.lineTo(xR.x, xR.y);
	c.lineTo(cent.x, cent.y);
	c.rect(cent.x, cent.y, -w / 8, -h/4);
	c.arc(cent.x, cent.y, (w + h) / 8, Math.PI*1.5, 0 );
	c.fill();
}

function drawAxes() {
	c.lineWidth = 2;
	c.fillStyle = config.canvas.axesColor;
	c.strokeStyle = config.canvas.axesColor;
	//Oy
	drawLine(w / 2, h - 10, w / 2, 10); 
	drawLine(w / 2, 10, w / 2 - 5, 20);
	drawLine(w / 2, 10, w / 2 + 5, 20);
	c.fillText("y", w / 2 + 10, 20);

	//Ox
	drawLine(10, h / 2, w - 10, h / 2); 
	drawLine(w - 10, h / 2, w - 20, h / 2 - 5);
	drawLine(w - 10, h / 2, w - 20, h / 2 + 5);
	c.fillText("x", w - 30, h / 2 - 10);
	c.lineWidth = 1;
}

function setBaseValues() {
	canvas.width = config.canvas.resolution;
	canvas.height = config.canvas.resolution;

	w = canvas.width;
	h = canvas.height;
	c.font = `20px Lucida Console, sans-serif`;

	yR = new Point(w / 2, h / 4);
	yMinR = new Point(w / 2, (3 * h) / 4);
	xR = new Point((3 * w) / 4, h / 2);
	xMinR = new Point(w / 4, h / 2);
	cent = new Point(w / 2, h / 2);

}


function drawMarks() {
	let marks = [-1, -1/2, 1/2, 1]
	let lineLength = 10;

	//draw ticks for R, R/2 etc.
	for (const x of marks) {
		drawLine( 
			w/2+(x*w/4) ,   h/2-lineLength, 
			w/2+(x*w/4) ,   h/2+lineLength )
	}
	for (const y of marks) {
		drawLine( 
			w/2-lineLength, h/2+(y*h/4), 
			w/2+lineLength, h/2+(y*h/4))
	}

	//draw letters
	c.fillText("R", w / 2 + 5, h / 4 + 5);
	c.fillText("-R", w / 2 + 5, (3 * h) / 4 + 5);
	c.fillText("-R", w / 4 - 5, h / 2 + 25);
	c.fillText("R", (3 * w) / 4 - 5, h / 2 + 25);
	c.fillText("R/2", h / 2 + 8, (3 * h) / 8 + 6);
	c.fillText("-R/2", h / 2 + 8, (5 * h) / 8 + 6);
	c.fillText("-R/2", (3 * w) / 8 - 20, h / 2 + 25);
	c.fillText("R/2", (5 * w) / 8 - 20, h / 2 + 25);

}




