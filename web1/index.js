import {Result} from './Result.js';
import {Point} from './Point.js';
import {Validator} from './Validator.js';
import {checkHit} from './HitCheck.js';
import {drawGraph, initializeGraph, drawAHitPoint} from './Graph.js';
import {config} from './config.js';

	// declaration hell //

//map of selected x,y,r
const selectedValuesMap = new Map();

let xTextField = document.getElementById("xTextField");
xTextField.addEventListener("change", updateValue);

const yValues = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
const rValues = [1, 2, 3, 4, 5];
const yButtonSpace = document.getElementById("ys");
const rButtonSpace = document.getElementById("rs");


let form = document.getElementById("form");
form.addEventListener("submit", (event) => {
	event.preventDefault();
	submitValues();
});

let errorTextbox = document.getElementById("errorMessage");

let xValidator = new Validator( (x) => (x > -5 && x < 3) );
xValidator.setErrorMessage("X must belong to (-5.0 ; 3.0)");
let yValidator = new Validator( (y) => yValues.includes(y) );
yValidator.setErrorMessage("Y must belong to " + yValues.toString());
let rValidator = new Validator( (r) => rValues.includes(r) );
rValidator.setErrorMessage("R must belong to " + rValues.toString());

let resultTable = document.getElementById("resultTable");
let storedJSON = localStorage.getItem(config.STORAGE_KEY);

let estimationTextField = document.getElementById("estimationText");
estimationTextField.setAttribute('style', 'white-space: pre;');
	// end of declaration hell //




	// -- main -- //

// Draw buttons
arrToButtons(yValues, "y").forEach(
	(button) => {
		yButtonSpace.appendChild(button);
	});

arrToButtons(rValues, "r").forEach(
	(button) => {
		rButtonSpace.appendChild(button);
	});

// self explanotary tbh
let canvas = document.getElementById("graph");
initializeGraph(canvas);
drawGraph();

// Load results from LocalStorage
let resultArr = storedJSON ? JSON.parse(storedJSON) : [];
resultArr.forEach((res) => writeResultToTable(res));

startEstimationWorker();

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
	console.log("updateValue(" + e.target.value + ") " + isNaN(e.target.value));
	if (!isNaN(e.target.value)) {
		selectedValuesMap.set("x", e.target.value);
	} else {
		selectedValuesMap.set("x", null);
	}
}


function validateValues(x, y, r) {
	let validationState = { isValid: true, errorMessage: "Error! " };
	xValidator.validate(x, validationState); 
	yValidator.validate(y, validationState); 
	rValidator.validate(r, validationState); 

	errorTextbox.textContent = validationState.errorMessage;
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
		hitCell.style.backgroundColor = config.successHitColor;
	} else {
		hitCell.textContent = "Нет";
		hitCell.style.backgroundColor = config.failHitColor;
	}
	dateCell.textContent = new Date(result.timestamp).toLocaleString("ru-RU", {
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	});
}

function startEstimationWorker() {
	let estimationWorker = new Worker("Monte-Carlo.js", { type: 'module' });
	console.log("Created worker:");
	console.log(estimationWorker);
	estimationWorker.postMessage(0);
	console.log("Posted message to worker");

	estimationWorker.onmessage = (e) => {
		estimationTextField.textContent = 
			`Estimated area: ${(e.data.estimatedArea).toFixed(6)} \nAbsolute delta: ${(e.data.absoluteDelta).toFixed(6)}\nRelative delta: ${(e.data.relativeDelta*100).toFixed(2)}%\nSuccessfull hits: ${e.data.hitsSuccess}/${e.data.hitsTotal}`;	
		drawAHitPoint(new Point((e.data.x+2)/4*config.canvas.resolution, (-e.data.y+2)/4*config.canvas.resolution), e.data.isHit);
	}
}
