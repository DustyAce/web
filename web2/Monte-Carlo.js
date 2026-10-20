import {checkHit} from './HitCheck.js';
import {config} from './config.js';
import {drawGraphWithShape} from './Graph.js';

let hits = {total: 0, success: 0};
let r = 1; 	// radius of the figure
let mul = 1.2;  // radius of the checked square
let totalArea = mul*2*mul*2;
let trueArea = r**2*(1 + Math.PI/4);
var x,y,estimate,message,isHit;
let running = false;


onmessage = (e) => {
	running = e.data;
	if (running) { 
		console.log("Starting worker for Monte-Carlo and the Holy Grail");
		start(); 
	}

};

async function start() {
	while (running) {
		doEstimation();
		await sleep(config.monteCarloRate);
	}
}

function doEstimation() {
	x = mul*(Math.random()*2-1);
	y = mul*(Math.random()*2-1);
	isHit = checkHit(x,y,r);
	if ( isHit ) { hits.success += 1; }
	hits.total += 1;
	estimate = hits.success / hits.total * totalArea; 
	message = {
		estimatedArea:	estimate,
		absoluteDelta:	estimate-trueArea,
		relativeDelta:	estimate/trueArea-1,
		hitsTotal:	hits.total,
		hitsSuccess:	hits.success,
		x: x, y: y, isHit: isHit 
	};
	postMessage(message);
}

async function sleep(ms) {
	return new Promise( (resolve) => setTimeout(resolve, ms) );
}
