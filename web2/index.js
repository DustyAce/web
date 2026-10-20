import {Result} from './Result.js';
import {Point} from './Point.js';
import {Validator} from './Validator.js';
import {checkHit} from './HitCheck.js';
import {drawEmptyGraph, drawGraphWithShape, initializeGraph, drawAHitPoint} from './Graph.js';
import {config} from './config.js';

	// declaration hell //

//map of selected x,y,r
const selectedValuesMap = new Map();

let xTextField = document.getElementById("xTextField");
xTextField.addEventListener("change", updateValue);
let yTextField = document.getElementById("yTextField");
yTextField.addEventListener("change", updateValue);
let rTextField = document.getElementById("rTextField");
rTextField.addEventListener("change", updateValue);

let form = document.getElementById("form");
form.addEventListener("submit", (event) => {
	event.preventDefault();
	submitValues();
});

let errorTextbox = document.getElementById("errorMessage");

let xValidator = new Validator( (x) => (!isNaN(x) && x > -5 && x < 3) );
xValidator.setErrorMessage("X must belong to (-5.0 ; 3.0)");
let yValidator = new Validator( (y) => (!isNaN(y) && y > -5 && y < 5) );
yValidator.setErrorMessage("Y must belong to (-5.0; 5.0)");
let rValidator = new Validator( (r) => (!isNaN(r) && r > 1 && r < 4) );
rValidator.setErrorMessage("R must belong to (1.0; 4.0)");

let validators = new Map([
	["x", xValidator],
	["y", yValidator],
	["r", rValidator]
]);

let resultTable = document.getElementById("resultTable");
let storedJSON = localStorage.getItem(config.STORAGE_KEY);

let estimationTextField = document.getElementById("estimationText");

let monteCarloButton = document.getElementById("startMCButton");

let estimationWorker = new Worker("Monte-Carlo.js", { type: 'module' });
let estimationIsRunning = false;
	// end of declaration hell //




	// -- main -- //
//legacy
// Draw buttons
//arrToButtons(yValues, "y").forEach(
//	(button) => {
//		yButtonSpace.appendChild(button);
//	});

//arrToButtons(rValues, "r").forEach(
//	(button) => {
//		rButtonSpace.appendChild(button);
//	});

// self explanotary tbh
let canvas = document.getElementById("graph");
initializeGraph(canvas);
drawGraphWithShape();

// Load results from LocalStorage
let resultArr = storedJSON ? JSON.parse(storedJSON) : [];
resultArr.forEach((res) => writeResultToTable(res));

monteCarloButton.onclick = () => {
	drawEmptyGraph();
	monteCarloButton.textContent =
		estimationIsRunning ? 
		"> Start Monte Carlo" :
		"> Stop Monte Carlo";
	estimationIsRunning = !estimationIsRunning;
	messageEstimationWorker();
}

	// -- end of main -- //




	// welcome to function hell //
function arrToButtons(arr, name) {
	let tmpButtons = arr.map((val) => {
		let button = document.createElement("button");
		button.textContent = val;
		button.value = val;
		button.type = "button";
		button.onclick = () => {
			selectedValuesMap.set(name, button.value);
			tmpButtons.forEach((btn) => {
				if (btn.value == button.value) {
					btn.classList.add("btnActive");
				} else {
					btn.classList.remove("btnActive");
				}
			});
		};
		return button;
	});
	return tmpButtons;
}

function updateValue(e) {
	let validator = validators.get(e.target.name);
	if (validator.validateValueOnly(e.target.value)) {
		selectedValuesMap.set(e.target.name, e.target.value);
	} else {
		selectedValuesMap.set(e.target.name, null);
	}
}


function validateValues(x, y, r) {
	let validationState = { isValid: true, errorMessage: "Error! " };
	xValidator.validate(x, validationState); 
	yValidator.validate(y, validationState); 
	rValidator.validate(r, validationState); 

	errorTextbox.innerText = validationState.errorMessage;
	errorTextbox.hidden = validationState.isValid;
	console.log(validationState);
	return validationState.isValid;
}

function submitValues() {
	let x = parseFloat(selectedValuesMap.get("x"));
	let y = parseInt(selectedValuesMap.get("y"));
	let r = parseInt(selectedValuesMap.get("r"));
	let timestamp = new Date();
	if (validateValues(x, y, r)) {
		let isHit = checkHit(x, y, r);
		let result = new Result(x, y, r, isHit, timestamp);
		if (!estimationIsRunning) { drawGraphWithShape(); }
		drawAHitPoint( xyToGraphPoint(1.0*x/r, 1.0*y/r) , isHit , 10);
		console.log(xyToGraphPoint(1.0*x/r, 1.0*y/r))
		console.log("checkHit result: " + isHit);
		writeResultToTable(result);
		writeResultToStorage(result);
	}
}

function writeResultToStorage(result) {
	resultArr.push(result);
	localStorage.setItem(config.STORAGE_KEY, JSON.stringify(resultArr));
}

function writeResultToTable(result) {
	let newRow = resultTable.insertRow(2);
	let xCell = newRow.insertCell();
	let yCell = newRow.insertCell();
	let rCell = newRow.insertCell();
	let hitCell = newRow.insertCell();
	let dateCell = newRow.insertCell();

	xCell.textContent = result.x;
	yCell.textContent = result.y;
	rCell.textContent = result.r;
	if (result.isHit) {
		hitCell.textContent = "Да";
		hitCell.style.color = config.successHitColor;
	} else {
		hitCell.textContent = "Нет";
		hitCell.style.color = config.failHitColor;
	}
	dateCell.textContent = new Date(result.timestamp).toLocaleString("ru-RU", {
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	});
}

function xyToGraphPoint(x, y) {
	return new Point(
		(x+2)/4*config.canvas.resolution,
		(-y+2)/4*config.canvas.resolution
	);
}

function messageEstimationWorker() {
	estimationWorker.postMessage(estimationIsRunning);
	console.log("Posted message to worker");

	if (!estimationIsRunning) {
		drawGraphWithShape();
	}

	estimationWorker.onmessage = (e) => {
		estimationTextField.innerText = 
		`Estimated area: ${(e.data.estimatedArea).toFixed(6)} 
		Absolute delta: ${(e.data.absoluteDelta).toFixed(6)}
		Relative delta: ${(e.data.relativeDelta*100).toFixed(2)}%
		Successfull hits: ${e.data.hitsSuccess}/${e.data.hitsTotal}`;	
		drawAHitPoint(xyToGraphPoint(e.data.x,e.data.y,), e.data.isHit, 3);
	}
}
