import {checkHit} from './HitCheck.js';
import {config} from './config.js';

let hits = {total: 0, success: 0};
let r = 1;
let totalArea = r*2*r*2;
let trueArea = (24 + Math.PI)*r*r / 16.0;
var x,y,estimate,message,isHit;

onmessage = (e) => {
	console.log("Starting worker for Monte-Carlo and the Holy Grail");
	start();
};

async function start() {
	while (true) {
		doEstimation();
		await sleep(config.monteCarloRate);
	}
}

function doEstimation() {
	x = Math.random()*2-1;
	y = Math.random()*2-1;
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
