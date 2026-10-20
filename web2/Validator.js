export class Validator {
	#check;
	#errorMessage;

	constructor( checkFunction) {
		this.check = checkFunction;
		this.errorMessage = checkFunction.toString();
		console.log("Validator constr: " + checkFunction.toString())
	}

	setErrorMessage(newMessage) {
		this.errorMessage = newMessage;
	}


	//the passed errorOutput should have a 'errorMessage' property for the output
	//and a boolean 'isValid' property for the uhhhh thing
	validate( value, validationState ) {
		console.log(".validate("+ value +") called for " + this.check.toString())
		let ret = this.check(value);
		if (!ret) {
			validationState.errorMessage += "\n" +this.errorMessage;
		}
		validationState.isValid = validationState.isValid && ret;
	}

	validateValueOnly( value ) {
		return this.check(value);
	}
}
