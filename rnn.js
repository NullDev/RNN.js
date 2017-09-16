"use strict";

////////////////////////////////
//----------------------------//
// Copyright (c) 2017 NullDev //
//----------------------------//
////////////////////////////////

var rate = 0.05;

var norm = 0.5;

var rept = 100000;

function isset(_var) { return (_var && _var != null && _var != "") ? true : false; }

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
		"\n"                   +
		"  ################\n" +
		"  # RNN.js START #\n" +
		"  ################\n"
	);

	var _check = function(inArr){
		var _errs = [];
		inArr.forEach(function(i){ if (isNaN(i)) _errs.push(i); });
		_errs.length <= 0 ? rnn(inArr) : _exit(2, _errs);
	};

	var _exit = function(err, chars){
		switch(err){
			case 1: {
				log("Error: No inputs specified!");
				break;
			}
			case 2: {
				chars = isset(chars) ? prettify(chars, false) : "err";
				log("Error: Not all inputs are integers! Failed to parse: " + chars);
				break;
			}
			default: break;
		}
		console.log();
		process.exit(1);
	};

	var input = process.argv.slice(2);
	isset(input) ? _check(input) : _exit(1);
}

function rnneval(in_len){
	var _index = 1;
	var node = new Array(_index);
	for (var i = 0; i < _index; i++){
		node[i] = new Array(in_len);
		for (var j = 0; j < in_len; j++) node[i][j] = 0;
	} 
	return node;
}

function prettify(arr, nl){
	arr = JSON.stringify(arr).replace(/\[|\]/g, "")
	return nl ? arr.replace(/\,/g, "\n") : arr.replace(/\,/g, ", ");
}

function rnn(input){
	var sem = null, len = null;

	var ST = new Date();
	log("Input: " + prettify(input, false));

	var neu1 = Math.random() - norm;
	var neu2 = Math.random() - norm;
	var neu3 = Math.random() - norm;

	len = input.length;
	var evalIn = rnneval(len);
	var output = rnneval(len);

	var calcL = function(outpt, d, inpt){
		var _pt1 = outpt[0][d + 1];
		var _pt2 = inpt[d + 1];
		return _pt1 - _pt2;
	};

	var calcR = function(n2, outpt, d, sem){
		var _out = outpt[0][d + 1];
		var _pt1 = n2 * _out;
		var _pt2 = (1 - _out) * sem;
		return _pt1 * _pt2;
	};

	for (var i = 0; i < rept; i++){
		for (var j = 0; j < len - 1; j++){
			evalIn[0][j] = neu1 * input[j] + neu2 * output[0][j] + neu3;
			output[0][j + 1] = 1 / (1 + Math.exp(-1 * evalIn[0][j])); 
		}
		for (var j = 0; j < len - 1; j++){
			for (var t = 0; t < j + 1; t++){
				var d = j - t;
				t == 0 ? sem = calcL(output, d, input) : sem = calcR(neu2, output, d, sem);
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
		"\n"                  +
		"  ###############\n" +
		"  # RNN.js STOP #\n" +
		"  ###############\n"
	);
	process.exit(0);
}
init();
