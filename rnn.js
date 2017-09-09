"use strict";

////////////////////////////////
//----------------------------//
// Copyright (c) 2017 NullDev //
//----------------------------//
////////////////////////////////

const noop = () => {};

const rate = 0.05;

const norm = 0.5;

function isset(_var) { return (_var && _var != null && _var != "" ) ? true : false; }

function getTS() {
	var date = new Date();
	var hour = date.getHours(),
		min  = date.getMinutes(),
		sec  = date.getSeconds();

	hour  = (hour < 10 ? "0" : "") + hour;
	min   = (min  < 10 ? "0" : "") + min;
	sec   = (sec  < 10 ? "0" : "") + sec;

    return "[" + hour + "h:" + min + "m:" + sec + "s]";
}

function log(text){ console.log(getTS() + "\xa0" + text); }

function init(){
	console.log(
		"\n"                     +
		"  ################\n" +
		"  # RNN.js START #\n" +
		"  ################\n"
	);

	var _check = function(inArr){
		var _errs = [];
		inArr.forEach(function(i){ isNaN(i) ? _errs.push(i) : noop(); });
		_errs.length <= 0 ? rnn(inArr) : _exit(2, _errs);
	};

	var _exit = function(err, chars){
		chars = JSON.stringify(chars).replace(/\,/g, ", ").replace(/\[|\]/g, "");
		switch(err){
			case 1: {
				log("Error: No inputs specified!");
				break;
			}
			case 2: {
				log("Error: Not all inputs are integers! Failed to parse: " + chars);
				break;
			}
		}
		console.log();
		process.exit(1);
	};

	const input = process.argv.slice(2);
	isset(input) ? _check(input) : _exit(1);
}

function rnneval(y, x){
	var i = 0, j = 0, k = 0;
	function ex(_n1, _n2){
		var node = new Array(_n1);
		for (k; k < _n1; k++) node[k] = new Array(_n2);
		return node;
	}
	var rec = ex(y, x);
	for(i; i < y; i++) for(j; j < x; j++) rec[i][j] = 0; 
	return rec;
}

function prettify(arr, nl){
	var _ = JSON.stringify(arr).replace(/\[|\]/g, "")
	return nl ? _.replace(/\,/g, "\n") : _.replace(/\,/g, ", ");
}

function rnn(input){
	var sem = null, len = null;

	var ST = new Date();
	log("Input: " + prettify(input, false));

	var neu1 = Math.random() - norm;
	var neu2 = Math.random() - norm;
	var neu3 = Math.random() - norm;

	len = input.length;
	var evalIn = rnneval(1, len);
	var output = rnneval(1, len);

	for (var i = 0; i < 100000; i++){
		for (var j = 0; j < len -1 ; j++){
			evalIn[0][j] = neu1 * input[j] + neu2 * output[0][j] + neu3;
			output[0][j + 1] = 1 / (1 + Math.exp(-1* evalIn[0][j])); 
		}
		for (var j = 0; j < len - 1 ; j++){
			for (var t = 0; t < j + 1; t++){
				var d = j - t;
				t == 0 ? sem = output[0][d + 1] - input[d + 1] : sem = neu2 * output[0][d + 1] * (1 - output[0][d + 1]) * sem;
				neu1 = neu1 - rate * sem * input[d];
				neu2 = neu2 - rate * sem * output[0][d];
				neu3 = neu3 - rate * sem;
			}
		}
	}
	for (var j = 0; j < len - 1 ; j++){
		evalIn[0][j] = neu1 * input[j] + neu2 * output[0][j] + neu3;
		output[0][j + 1] = 1 / (1 + Math.exp(-1 * evalIn[0][j])); 
	}
	log("Outputs:\n\n" + prettify(output, true));
	console.log();
	var ET = new Date();
	var ms = ET - ST;
	log("Took " + ms + "MS");
	console.log(
		"\n"                     +
		"  ###############\n" +
		"  # RNN.js STOP #\n" +
		"  ###############\n"
	);
	process.exit(0);
}

init();
