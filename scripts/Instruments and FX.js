function InstrumentConstructorTemplate(){

	this.output = audioCtx.createGain();

}

InstrumentConstructorTemplate.prototype = {

	output: this.output,

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function Instrument(){

	this.input = audioCtx.createGain();
	this.output = audioCtx.createGain();
	this.startArray = [];

}

Instrument.prototype = {

	input: this.input,
	output: this.output,
	startArray: this.startArray,

	instrumentMethod: function(){
		this.startArray = [];
	},

	lineShape: function(rate, sequenceLength){

		this.rate = rate;
		this.sequenceLength = sequenceLength;

		this.vArray = new Sequence();
		this.tArray = new Sequence();
		this.eArray = new Sequence();

		// presets
		this.vArray.loop(this.sequenceLength, [1, 0]);
		this.tArray.random(this.sequenceLength, [0.1, 0.05, 0.025, 0.2]);
		this.eArray.random(this.sequenceLength, [2, 4, 3, 0.5, 0.25, 0.125]);

		this.lArray = arrayLace(this.vArray.sequence, this.tArray.sequence);

		this.line = new BreakPoint(this.lArray, this.eArray.sequence);
		this.line.loop = true;
		this.line.playbackRate = this.rate;

		this.w = new MyWaveShaper();
		this.w.makeFm(201, 4000, 1); // 20, 101, 1
		this.wG = new MyGain(0.4);

		this.f1 = new MyBiquad("highpass", 80, 0);
		this.f2 = new MyBiquad("lowshelf", 300, 0);
		this.f2.biquad.gain.value = -5;

		this.line.connect(this.wG);
		this.wG.connect(this.w);
		this.w.connect(this.f1);
		this.f1.connect(this.f2);
		this.f2.connect(this.output);

		this.startArray = [this.line];

	},

	filterTick: function(rate, type, freq, Q){

		this.rate = rate;
		this.type = type;
		this.freq = freq;
		this.Q = Q;

		this.o = new LFO(0, 1, rate);
		this.o.buffer.makeSawtooth(1);
		this.oF = new MyBiquad(this.type, this.freq, this.Q);

		this.o.connect(this.oF);
		this.oF.connect(this.output);

		this.startArray = [this.o];

	},

	toneRamp: function(fund, rate, oAmF1, oAmF2, oAmD1, oAmD2, panVal){

		this.fund = fund;
		this.rate = rate;
		this.oAmF1 = oAmF1;
		this.oAmF2 = oAmF2;
		this.oAmD1 = oAmD1;
		this.oAmD2 = oAmD2;
		this.panVal = panVal;

		this.s = new MyOsc("sine", this.fund);

		this.l = new LFO(0, 1, this.rate);
		this.l.buffer.makeInverseSawtooth(4);
		this.lF = new MyBiquad("lowpass", 20, 0);
		this.aG = new MyGain(0);

		this.oAm = new OffsetSquareAM2(this.oAmF1, this.oAmF2, this.oAmD1, this.oAmD2);
		this.oAm.smoothingFilter.biquad.frequency.value = 20;

		this.w = new MyWaveShaper();
		this.w.makeAm(20, 11, 1);
		this.wG = new MyGain(0.01);

		this.w2 = new MyWaveShaper();
		this.w2.makeFm(randomFloat(5, 8.1), randomFloat(0.1, 0.31), 1);
		this.wG2 = new MyGain(0.03);

		this.f = new MyBiquad("highpass", 80, 1);

		this.pan = new MyPanner2(this.panVal);

		this.l.connect(this.lF);

		this.s.connect(this.aG); this.lF.connect(this.aG.gain.gain);
		this.aG.connect(this.oAm);
		this.oAm.connect(this.wG);
		this.wG.connect(this.w);
		this.w.connect(this.wG2);
		this.wG2.connect(this.w2);
		this.w2.connect(this.f);
		this.f.connect(this.pan);
		this.pan.connect(this.output);

		this.startArray = [this.s, this.oAm, this.l];

	},

	noiseSynth: function(fund, Q, eArray){

		this.fund = fund;
		this.Q = Q;
		this.eArray = eArray;

		this.s = new NoiseTone(fund, Q);
		this.e = new Envelope(eArray);
		this.eG = new MyGain(0);

		this.s.connect(this.eG); this.e.connect(this.eG.gain.gain);
		this.eG.connect(this.output);

		this.startArray = [this.s];
		this.playArray = [this.e];

	},

	start: function(){
		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].start();
		}
	},


	stop: function(){
		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].stop();
		}
	},

	play: function(){
		for(var i=0; i<this.startArray.length; i++){
			this.playArray[i].start();
		}
	},

	playAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.startArray.length; i++){
			this.playArray[i].startAtTime(this.time);
		}

	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.startArray.length; i++){
				this.startArray[i].startAtTime(this.time);
		}

	},

	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.startArray.length; i++){
				this.startArray[i].stopAtTime(this.time);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function Effect(){

	this.input = audioCtx.createGain();
	this.filterFade = new FilterFade(0);
	this.output = audioCtx.createGain();
	this.startArray = [];

	this.input.connect(this.filterFade.input);

}

Effect.prototype = {

	input: this.input,
	output: this.output,
	filterFade: this.filterFade,
	startArray: this.startArray,

	effectMethod: function(){
		this.startArray = [];
	},

	thru: function(){

		this.filterFade.connect(this.output);

	},

	thru2: function(){

		this.filterFade.connect(this.output);
		this.output.gain.value = 0;

	},

	delayLine2: function(rate, sequenceLength){

		this.rate = rate;
		this.sequenceLength = sequenceLength;

		this.vArray = new Sequence();
		this.tArray = new Sequence();
		this.eArray = new Sequence();

		this.vArray.loop(this.sequenceLength, [1, 0]);
		this.tArray.loop(this.sequenceLength, [0.1, 0.05, 0.025, 0.2]);
		this.eArray.loop(this.sequenceLength, [2, 4, 3, 0.5, 0.25, 0.125]);

		this.lArray = arrayLace(this.vArray.sequence, this.tArray.sequence);

		this.line = new BreakPoint(this.lArray, this.eArray.sequence);
		this.line.loop = true;
		this.line.playbackRate = this.rate;

		this.aG = new MyGain(0);
		this.dly = new MyStereoDelay(0.1, 0.01, 0.1, 1);
		this.f = new MyBiquad("highpass", 3000, 0);

		this.w = new MyWaveShaper();
		this.w.makeFm(120, 12, 1);
		this.wG = new MyGain(0.05);

		this.g1 = new MyGain(0.1);
		this.g2 = new MyGain(0.2);

		this.filterFade.connect(this.aG); this.line.connect(this.aG.gain.gain);
		this.aG.connect(this.dly);
		this.dly.connect(this.f);
		this.f.connect(this.g1);
		this.g1.connect(this.output);

		this.f.connect(this.wG);
		this.wG.connect(this.w);
		this.w.connect(this.g2);
		this.g2.connect(this.output);

		this.startArray = [this.line];

	},

	filterPan: function(){

		this.pan = new MyPanner2(randomFloat(-1, 1));

		this.filterFade.connect(this.pan);
		this.pan.connect(this.output);

	},

	slapTrail: function(){

		this.dly = new MyDelay(randomFloat(0.05, 0.1), 0.2, 1);
		this.pan = new MyPanner2(randomFloat(-1, 1));
		this.hp = new MyBiquad("bandpass", randomInt(2000, 6000), randomInt(5, 10));

		this.filterFade.connect(this.hp);
		this.hp.connect(this.dly);
		this.dly.connect(this.pan);
		this.pan.connect(this.output);

	},

	slap: function(){

		this.dly = new MyStereoDelay(randomFloat(0.08, 0.15), randomFloat(0.08, 0.15), randomFloat(0, 0.1), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	slap2: function(){

		this.dly = new MyStereoDelay(randomFloat(0.08, 0.15), randomFloat(0.08, 0.15), randomFloat(0, 0.1), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	echo: function(){

		this.dly = new MyStereoDelay(randomFloat(0.35, 0.6), randomFloat(0.35, 0.6), randomFloat(0, 0.2), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	sigmoidCrush: function(){

		this.w = new MyWaveShaper();
		this.w.makeSigmoid(100);

		this.c = new MyCompressor(20, 0.001, 0.001, -80, 1);

		this.filterFade.connect(this.c);
		this.c.connect(this.w);
		this.w.connect(this.output);

	},

	delayLine: function(rate, sequenceLength){

		this.rate = rate;
		this.sequenceLength = sequenceLength;

		this.vArray = new Sequence();
		this.tArray = new Sequence();
		this.eArray = new Sequence();

		this.vArray.loop(this.sequenceLength, [1, 0]);
		this.tArray.loop(this.sequenceLength, [0.1, 0.05, 0.025, 0.2]);
		this.eArray.loop(this.sequenceLength, [2, 4, 3, 0.5, 0.25, 0.125]);

		this.lArray = arrayLace(this.vArray.sequence, this.tArray.sequence);

		this.line = new BreakPoint(this.lArray, this.eArray.sequence);
		this.line.loop = true;
		this.line.playbackRate = this.rate;

		this.aG = new MyGain(0);
		this.dly = new MyStereoDelay(0.1, 0.01, 0.1, 1);
		this.f = new MyBiquad("highpass", 3000, 0);

		this.filterFade.connect(this.aG); this.line.connect(this.aG.gain.gain);
		this.aG.connect(this.dly);
		this.dly.connect(this.f);
		this.f.connect(this.output);

		this.startArray = [this.line];

	},

	delayShapeLine: function(rate, sequenceLength){

		this.rate = rate;
		this.sequenceLength = sequenceLength;

		this.vArray = new Sequence();
		this.tArray = new Sequence();
		this.eArray = new Sequence();

		this.vArray.loop(this.sequenceLength, [1, 0]);
		this.tArray.loop(this.sequenceLength, [0.1, 0.05, 0.025, 0.2]);
		this.eArray.loop(this.sequenceLength, [2, 4, 3, 0.5, 0.25, 0.125]);

		this.lArray = arrayLace(this.vArray.sequence, this.tArray.sequence);

		this.line = new BreakPoint(this.lArray, this.eArray.sequence);
		this.line.loop = true;
		this.line.playbackRate = this.rate;

		this.aG = new MyGain(0);
		this.dly = new MyStereoDelay(0.1, 0.01, 0.1, 1);
		this.f = new MyBiquad("highpass", 3000, 0);

		this.w = new MyWaveShaper();
		this.w.makeFm(120, 12, 1);
		this.wG = new MyGain(0.05);

		this.filterFade.connect(this.aG); this.line.connect(this.aG.gain.gain);
		this.aG.connect(this.dly);
		this.dly.connect(this.f);
		this.f.connect(this.wG);
		this.wG.connect(this.w);
		this.w.connect(this.output);

		this.startArray = [this.line];

	},

	shortDelay: function(){

		this.dly = new MyStereoDelay(randomFloat(0.01, 0.035), randomFloat(0.01, 0.035), randomFloat(0, 0.1), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	shortDelay2: function(){

		this.dly = new MyStereoDelay(randomFloat(0.01, 0.035), randomFloat(0.01, 0.035), randomFloat(0, 0.1), 1);

		this.filterFade.connect(this.dly);
		this.dly.connect(this.output);

	},

	powerSequenceDelay: function(nDelays, base, eArray, fbArray){

		this.nDelays = nDelays;
		this.base = base;
		this.eArray = eArray;
		this.fbArray = fbArray;

		this.dLS = new Sequence();
		this.dRS = new Sequence();

		this.dLS.randomPowers(this.nDelays, this.base, this.eArray);
		this.dRS.randomPowers(this.nDelays, this.base, this.eArray);

		this.dLS = this.dLS.sequence;
		this.dRS = this.dRS.sequence;

		this.delay = new MultiStereoDelay(this.dLS, this.dRS, this.fbArray);

		this.filterFade.connect(this.delay);
		this.delay.connectAll(this.output);

	},

	switch: function(switchVal){

		var switchVal = switchVal;

		this.filterFade.start(switchVal, 30);

	},

	switchAtTime: function(switchVal, time){

		this.switchVal = switchVal;
		this.time = time;

		this.filterFade.startAtTime(this.switchVal, 20, this.time);

	},

	switchSequence: function(valueSequence, timeSequence){

			var filterFade = this.filterFade;
			var valueSequence = valueSequence;
			var timeSequence = timeSequence;
			var v;
			var j=0;

			for(var i=0; i<timeSequence.length; i++){

				setTimeout(function(){

					v = valueSequence[j%valueSequence.length];
					filterFade.start(v, 20);
					j++;

				}, timeSequence[i]*1000);

			}

		},

	on: function(){

		this.filterFade.start(1, 30);

	},

	off: function(){

		this.filterFade.start(0, 20);

	},

	onAtTime: function(time){

		var filterFade = this.filterFade;

		setTimeout(function(){filterFade.start(1, 20);}, time*1000);

	},

	offAtTime: function(time){

		var filterFade = this.filterFade;

		setTimeout(function(){filterFade.start(0, 20);}, time*1000);

	},

	start: function(){

		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].start();
		}

	},

	stop: function(){

		for(var i=0; i<this.startArray.length; i++){
			this.startArray[i].stop();
		}

	},

	startAtTime: function(startTime){

		var startArray = this.startArray;
		var startTime = startTime;

		setTimeout(function(){
			for(var i=0; i<startArray.length; i++){
				startArray[i].start();
			}
		}, startTime*1000);

	},

	stopAtTime: function(stopTime){

		var startArray = this.startArray;
		var stopTime = stopTime;

		setTimeout(function(){
			for(var i=0; i<startArray.length; i++){
				startArray[i].stop();
			}
		}, startTime*1000);

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function MultiAmPad(fund, gainVal){

	this.fund = fund;
	this.gainVal = gainVal;

	this.output = audioCtx.createGain();
	this.output.gain.value = this.gainVal;

	// src

	this.o = new MyOsc("sine", fund);

	// fm

	this.fO = new MyOsc("sine", this.fund*0.5);
	this.fG = new MyGain(this.fund*0.1);

	// am multiOp

	this.fArray = [this.fund, (this.fund*P5)-this.fund, (this.fund*M3)-this.fund, this.fund*2];
	this.typeArray = [];
	this.gainArray = [];
	this.eArray = [];
	this.startArray = [];

	for(var i=0; i<this.fArray.length; i++){
		this.typeArray[i] = "sine";
		this.gainArray[i] = 1;
		this.eArray[i] = mPRandomEnvelope(70);
		this.startArray[i] = randomFloat(0, 4);
	}

	this.nOps = this.fArray.length;

	this.mOp = new MultiOperator(this.nOps);
	this.lengthArray = [];

	for(var i=0; i<this.nOps; i++){
		this.mOp.ops[i].op.setOp(this.typeArray[i], this.fArray[i], this.gainArray[i], this.eArray[i]);
		this.lengthArray[i] = this.mOp.ops[i].op.envelope.buffer.duration;
	}

	this.lengthArray.sort(function(a,b){return a-b});
	this.longestEnvelope = this.lengthArray[this.lengthArray.length-1];

	// fx

	this.dB = new DelayBank([3, 4, 5], [0, 1, 2, 3]);
	this.fG = new MyGain(10);
	this.f = new MyBiquad("highpass", 100, 0);
	this.dst = new MyWaveShaper();
	this.dst.makeSigmoid(4);

	this.dly = new MyStereoDelay(randomFloat(0.09, 0.15), randomFloat(0.09, 0.15), randomFloat(0.19, 0.3), 1);

	this.dB.connect(this.fG);
	this.fG.connect(this.o.frequencyInlet);

	// gains

	this.oG = new MyGain(1);
	this.aG = new MyGain(0);
	this.dBG = new MyGain(1);
	this.dlyG = new MyGain(1);

	// connections

	this.o.connect(this.aG); 	this.mOp.connectAll(this.aG.gain.gain);
	this.aG.connect(this.dB);
	this.dB.connect(this.dst);
	this.dst.connect(this.dBG);
	this.dB.connect(this.dly);
	this.dly.connect(this.dlyG);

	this.oG.connect(this.f);
	this.dBG.connect(this.f);
	this.dlyG.connect(this.f);

	this.f.connect(this.output);

}

MultiAmPad.prototype = {

	output: this.output,
	longestEnvelope: this.longestEnvelope,

	start: function(){

		this.o.start();
		this.fO.start();

		for(var i=0; i<this.nOps; i++){
			this.mOp.ops[i].op.startAtTime(this.startArray[i], i);
		}

		this.o.stopAtTime(this.longestEnvelope);

	},

	stop: function(){

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

function mPRandomEnvelope(nPoints){

	var array = [];

	for(var i=0; i<nPoints; i++){
		array.push(randomFloat(0.1, 1), randomInt(1, 60)/(10*randomInt(1, 5)));
	}

	array.push(0, randomInt(1, 60)/(10*randomInt(1, 4)));

	return array;

}

//--------------------------------------------------------------

function SawSines(nNodes, freqArray, rateArray){

	this.freqArray = freqArray;
	this.rateArray = rateArray;

	this.nNodes = nNodes;

	this.osc = {};
	this.saw = {};
	this.amFilter = {};
	this.amGain = {};

	for(var i=0; i<this.nNodes; i++){

		this.osc[i] = {osc: new MyOsc("sine", this.freqArray[i])};

		this.saw[i] = {saw: new MyBuffer(1, 1, audioCtx.sampleRate)};
		this.saw[i].saw.makeTriangle();
		this.saw[i].saw.loop = true;
		this.saw[i].saw.playbackRate = this.rateArray[i];

		this.amFilter[i] = {filter: new MyBiquad("lowpass", 10, 1)};

		this.amGain[i] = {gain: new MyGain(0)};

		this.saw[i].saw.connect(this.amFilter[i].filter);

		this.osc[i].osc.connect(this.amGain[i].gain); this.amFilter[i].filter.connect(this.amGain[i].gain.gain.gain);

	}

}

SawSines.prototype = {

	nNodes: this.nNodes,
	osc: this.osc,
	saw: this.saw,
	amFilter: this.amFilter,
	amGain: this.amGain,

	setFreq: function(freq, idx){

		var freq = freq;
		var idx = idx;

		this.osc[idx].osc.osc.frequency.value = freq;

	},

	setFreqs: function(freqArray){

		var freqArray = freqArray;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.value = freqArray[i];
		}

	},

	setFreqsAtTime: function(freqArray, time){

		this.freqArray = freqArray;
		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.setValueAtTime(this.freqArray[i], this.time);
		}

	},

	start: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.start();
			this.saw[i].saw.start();
		}

	},

	stop: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stop();
			this.saw[i].saw.stop();
		}

	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.startAtTime(this.time);
			this.saw[i].saw.startAtTime(this.time);
		}

	},

	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stopAtTime(this.time);
			this.saw[i].saw.stopAtTime(this.time);
		}

	},

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.amGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.amGain[idx].gain.connect(audioNode);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function SawSines2(nNodes, freqArray, rateArray){

	this.freqArray = freqArray;
	this.rateArray = rateArray;

	this.nNodes = nNodes;

	this.osc = {};
	this.saw = {};
	this.amFilter = {};
	this.amGain = {};

	for(var i=0; i<this.nNodes; i++){

		this.osc[i] = {osc: new MyOsc("sine", this.freqArray[i])};

		this.saw[i] = {saw: new MyBuffer(1, 1, audioCtx.sampleRate)};
		this.saw[i].saw.makeInverseSawtooth(4);
		this.saw[i].saw.loop = true;
		this.saw[i].saw.playbackRate = this.rateArray[i];

		this.amFilter[i] = {filter: new MyBiquad("lowpass", 500, 0)};

		this.amGain[i] = {gain: new MyGain(0)};

		this.saw[i].saw.connect(this.amFilter[i].filter);

		this.osc[i].osc.connect(this.amGain[i].gain); this.amFilter[i].filter.connect(this.amGain[i].gain.gain.gain);

	}

}

SawSines2.prototype = {

	nNodes: this.nNodes,
	osc: this.osc,
	saw: this.saw,
	amFilter: this.amFilter,
	amGain: this.amGain,

	setFreq: function(freq, idx){

		var freq = freq;
		var idx = idx;

		this.osc[idx].osc.osc.frequency.value = freq;

	},

	setFreqs: function(freqArray){

		var freqArray = freqArray;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.value = freqArray[i];
		}

	},

	setFreqsAtTime: function(freqArray, time){

		this.freqArray = freqArray;
		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.osc.frequency.setValueAtTime(this.freqArray[i], this.time);
		}

	},

	start: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.start();
			this.saw[i].saw.start();
		}

	},

	stop: function(){

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stop();
			this.saw[i].saw.stop();
		}

	},

	startAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.startAtTime(this.time);
			this.saw[i].saw.startAtTime(this.time);
		}

	},

	stopAtTime: function(time){

		this.time = time;

		for(var i=0; i<this.nNodes; i++){
			this.osc[i].osc.stopAtTime(this.time);
			this.saw[i].saw.stopAtTime(this.time);
		}

	},

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.amGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.amGain[idx].gain.connect(audioNode);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function ShaperBank(nShapers, inGainArray, outGainArray){

	this.inGainArray = inGainArray;
	this.outGainArray = outGainArray;

	this.nShapers = nShapers;

	this.onGain = {};
	this.onConstant = new BufferConstant(1);
	this.on = new MyGain(0);
	this.onFilter = new MyBiquad("lowpass", 100, 0);

	this.inGain = {};
	this.shaper = {};
	this.outGain = {};

	this.cFreqArray = [];
	this.mFreqArray = [];

	for(var i=0; i<this.nShapers; i++){

		this.onGain[i] = {gain: new MyGain(0)};

		this.inGain[i] = {gain: new MyGain(this.inGainArray[i])};
		this.shaper[i] = {shaper: new MyWaveShaper()};
		this.cFreqArray[i] = randomFloat(5.75, 8);
		this.mFreqArray[i] = randomFloat(0.15, 0.6);
		this.shaper[i].shaper.makeFm(this.cFreqArray[i], this.mFreqArray[i], 1);
		this.outGain[i] = {gain: new MyGain(this.outGainArray[i])};

		this.onConstant.connect(this.on);
		this.on.connect(this.onFilter);
		this.onGain[i].gain.connect(this.inGain[i].gain); this.onFilter.connect(this.onGain[i].gain.gain.gain);
		this.inGain[i].gain.connect(this.shaper[i].shaper);
		this.shaper[i].shaper.connect(this.outGain[i].gain);

	}

	this.onConstant.start();

}

ShaperBank.prototype = {

	outGain: this.outGain,
	shaper: this.shaper,
	on: this.on,

	nShapers: this.nShapers,

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.outGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.outGain[idx].gain.connect(audioNode);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function ShaperBank3(nShapers, inGainArray, outGainArray){

	this.inGainArray = inGainArray;
	this.outGainArray = outGainArray;

	this.nShapers = nShapers;

	this.onGain = {};
	this.onConstant = new BufferConstant(1);
	this.on = new MyGain(0);
	this.onFilter = new MyBiquad("lowpass", 100, 0);

	this.inGain = {};
	this.shaper = {};
	this.outGain = {};

	// c: [6.231925337136491, 7.867743958008429, 6.939417852166363, 6.068919579519627, 7.9674183469799145];
	// m: [0.3653406403542844, 0.3175508290122275, 0.5933865921112328, 0.18351805299864302, 0.424806124239856];
	//
	// c: [7.192262616642821, 6.478248486313105, 7.343260590676074, 7.847024896311923, 5.8314791304567795]
	// m: [0.5219601727726426, 0.5501915602541868, 0.21016245548346688, 0.5171804189302571, 0.3779204076278616]
	//
	// c: [7.824927949058543, 6.619715764696342, 5.970045795201209, 6.71280950393465, 6.547994436233056]
	// m: [0.5679742774954697, 0.29845259015573256, 0.35448014741862155, 0.5220308549325777, 0.1831701068495036]
	//
	// c: [7.1015201475392615, 7.794666966579307, 6.252596531813404, 6.8331192793381845, 6.9751809387073935]
	// m: [0.38579644453946726, 0.37409663577165675, 0.19421666476671356, 0.3399035125661822, 0.42940235898409196]
	//
	//
	// c: [7.109169787982099, 6.84749322994286, 7.116841139349978, 7.648712606071907, 7.059630669067271]
	// m: [0.4636664852969816, 0.5878143069733712, 0.5595322541405733, 0.2827471097740061, 0.5831970956327296]
	//
	//
	// c: [5.780677032324114, 6.689130551430434, 6.592643864121602, 7.100084040096441, 7.50048436162394]
	// m: [0.18095004186738567, 0.2410650345737786, 0.5323885225312882, 0.5560364834536279, 0.4729509251634362]
	//
	// c: [7.275269673472973, 7.450850082997383, 7.028329572985877, 6.779442199744316, 6.298384528392307]
	// m: [0.5358993742036096, 0.2698652584138216, 0.3024228312915815, 0.5971773433853941, 0.501932324699187]
	//
	// c: [6.321531041531516, 5.900095647564013, 7.971320143195398, 6.102329400632958, 7.305267190395952]
	// m: [0.3504669345132938, 0.2974317593272182, 0.5487171455104367, 0.49167636218051947, 0.5842897933362398]
	//
	// c: [6.944077515911878, 5.996771546607448, 7.782068220630444, 7.295371762660661, 6.22030156652056]
	// m: [0.4198818933087932, 0.41120843051684086, 0.5130271592745194, 0.5037130768335866, 0.4194559728143078]
	//
	// c: [5.758089090435835, 6.788184614457315, 5.97020650577187, 7.9239161069082025, 5.7791014636466365]
	// m: [0.4848051426556771, 0.24251244596878413, 0.2651700544499964, 0.5627986921972257, 0.19998929289215348]
	//
	// c: [7.846447369610387, 7.830809174199801, 7.843827964771044, 7.118303351902375, 6.138307207337214]
	// m: [0.550607086329799, 0.34876222872769946, 0.5187334822102814, 0.3842044728350693, 0.233012948733284]
	//
	// c: [6.446271797805357, 7.6355563786160925, 6.87077854424053, 7.574385213001568, 6.420426947583957]
	// m: [0.22635225058537503, 0.565965668004974, 0.43184900169671503, 0.2923643185062329, 0.3175728999864658]
	//
	// c: [6.728953052580868, 7.972161205460542, 7.86524623861686, 7.62830178481686, 6.64281594757456]
	// m: [0.5441848502477649, 0.42437740287064185, 0.47655636373191645, 0.45297974202913727, 0.17455925880320997]
	//
	// c: [6.678361778948012, 7.339094521286626, 7.146526284383814, 7.271301900742074, 6.22746253757828]
	// m: [0.1884053059034042, 0.3582501326410356, 0.43238255106842194, 0.5001048691421058, 0.5648937525573766]
	//
	// c: [5.752026516137348, 6.767699421961983, 7.559459847571226, 6.791117412900686, 7.193926527110322]
	// m: [0.15138457820687753, 0.5907072475036793, 0.47335630966635334, 0.4103084028303522, 0.4640178239634203]
	//
	// c: [6.710984022575684, 6.63114475196584, 7.207988092603646, 6.920702034221282, 6.8317037769337965]
	// m: [0.46712566763331687, 0.302332334092863, 0.4458959531995176, 0.15917166124167195, 0.5507271561023558]
	//
	// c: [6.649077469468079, 7.068014652756571, 7.714771323847819, 7.0014629066482925, 6.557775640769031]
	// m: [0.25541503499835033, 0.20961099898091662, 0.4636945526246957, 0.17050008153891832, 0.28400118351727266]
	//
	// c: [7.3778521112533255, 7.169545455541397, 6.577588475584382, 7.847130265089179, 6.888142141730208]
	// m: [0.188183436919663, 0.3889056016321787, 0.5463175832851528, 0.1979231400907262, 0.4888125847700371]
	//
	// c: [5.987749093712314, 5.7858265391954244, 7.623591460612447, 7.990650058456199, 6.382637144736029]
	// m: [0.19912345209335153, 0.40565794713594594, 0.5155405396865834, 0.38115087909410594, 0.5269559959578516]
	//
	// c: [5.964126230222351, 6.795620957007239, 7.553996613486847, 7.545285746030034, 6.13241496225557]
	// m: [0.18673751108150197, 0.32107365199806726, 0.32251479178533576, 0.4720663064239998, 0.5957704449588795]
	//
	// c: [7.6289539319396695, 5.752151985043732, 7.5016085611090775, 7.1849213204448645, 5.889481059022617]
	// m: [0.5919894967893358, 0.5110233062792361, 0.16788427234190736, 0.4746341444506794, 0.24041520145473158]
	//
	// c: [6.201033434694719, 7.354546383460139, 7.613979403504054, 6.485111305778037, 6.413185428944601]
	// m: [0.160026038102501, 0.3841414087990335, 0.1795898754504689, 0.3263947330571364, 0.17177852535979984]
	this.cFreqArray = [6.201033434694719, 7.354546383460139, 7.613979403504054, 6.485111305778037, 6.413185428944601];
	this.mFreqArray = [0.160026038102501, 0.3841414087990335, 0.1795898754504689, 0.3263947330571364, 0.17177852535979984];

	for(var i=0; i<this.nShapers; i++){

		this.onGain[i] = {gain: new MyGain(0)};

		this.inGain[i] = {gain: new MyGain(this.inGainArray[i])};
		this.shaper[i] = {shaper: new MyWaveShaper()};
		this.shaper[i].shaper.makeFm(this.cFreqArray[i], this.mFreqArray[i], 1);
		this.outGain[i] = {gain: new MyGain(this.outGainArray[i])};

		this.onConstant.connect(this.on);
		this.on.connect(this.onFilter);
		this.onGain[i].gain.connect(this.inGain[i].gain); this.onFilter.connect(this.onGain[i].gain.gain.gain);
		this.inGain[i].gain.connect(this.shaper[i].shaper);
		this.shaper[i].shaper.connect(this.outGain[i].gain);

	}

	this.onConstant.start();

}

ShaperBank3.prototype = {

	outGain: this.outGain,
	shaper: this.shaper,
	on: this.on,

	nShapers: this.nShapers,

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.outGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.outGain[idx].gain.connect(audioNode);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function ShaperBank4(nShapers, inGainArray, outGainArray){

	this.inGainArray = inGainArray;
	this.outGainArray = outGainArray;

	this.nShapers = nShapers;

	this.onGain = {};
	this.onConstant = new BufferConstant(1);
	this.on = new MyGain(0);
	this.onFilter = new MyBiquad("lowpass", 100, 0);

	this.inGain = {};
	this.shaper = {};
	this.outGain = {};

	// c: [6.946317134329135, 7.02728602197001, 6.406071549446404, 6.886262882477359, 6.058346278012443];
	// m: [0.3357587649314052, 0.5411911806588506, 0.5335078939346486, 0.426485526366862, 0.1939475469837519];
	//
	// c: [5.999719218164387, 6.183888842610437, 7.904719119047191, 6.470927362129922, 6.716840811825663]
	// m: [0.5845252392908082, 0.5517560257099412, 0.437284149442697, 0.5770868010958331, 0.31394861823138887]
	//
	// c: [7.910187261095204, 7.680826112518469, 7.971868059075026, 7.168371282496842, 6.483568438750098]
	// m: [0.2932758411043582, 0.43626868987251133, 0.24673780617443852, 0.4587979616561769, 0.2704138426877398]
	//
	// c: [6.501900870450212, 7.25208765219283, 7.894551016413287, 6.878411569522784, 6.921048143961519]
	// m: [0.30002592843710174, 0.570415452617521, 0.2425809602144739, 0.5610560075746204, 0.3800724289910612]
	//
	// c: [7.354613811948235, 5.867488713274202, 7.9739674696873175, 6.70920107368362, 6.7128076654492475]
	// m: [0.1783437340813535, 0.264404280459846, 0.31346942130369415, 0.21800548329023728, 0.39980789977991893]
	//
	// c: [7.99820129793825, 5.82936914881717, 7.6788178332764625, 7.271958866571007, 6.887705410654055]
	// m: [0.29870186162104345, 0.49797277068131063, 0.4271709776612257, 0.19239747182902112, 0.5260654609998353]
	//
	// c: [7.017772321211255, 7.262160410580265, 6.7793152532238246, 7.641466786103727, 7.883866926532713]
	// m: [0.42678212548619965, 0.4619726389678096, 0.5607396042950805, 0.43264231423305355, 0.28894047153463964]
	//
	// c: [6.119666571514056, 6.141902652314008, 6.102627850742747, 7.89785495343764, 5.800945153173932]
	// m: [0.5921912532700669, 0.5698111595619719, 0.35807980422857527, 0.4831118657658623, 0.3963343551305285]
	//
	// c: [7.983557881540744, 7.178240287545101, 6.482495508694254, 7.2832004824246255, 6.9238911678366755]
	// m: [0.5566533575834233, 0.48871657067471763, 0.27860901768260604, 0.30439700011650495, 0.22374733596237512]
	//
	// c: [6.79609945562318, 6.4973054300039745, 6.887757262690121, 6.579234124545335, 7.727098298871003]
	// m: [0.4714626396795213, 0.2936747090238334, 0.25528608720057294, 0.1647514215810369, 0.4198072910598548]
	//
	// c: [6.000558092978179, 7.561537014694056, 5.776031108588836, 7.985472049091421, 5.881881984550412]
	// m: [0.29192006033678763, 0.5105718966457752, 0.21175995069988113, 0.3123615416321644, 0.5590222156449508]
	//
	// c: [7.244809891261988, 7.205521478706257, 7.9216954858041575, 6.541916488188457, 7.015716428967211]
	// m: [0.34073391358412486, 0.5121412411346968, 0.15766329857975867, 0.18721711427753035, 0.20552964472525015]
	//
	// c: [6.357844433717629, 7.667231982009848, 7.574255230293252, 7.222468991436861, 6.227361650602603]
	// m: [0.35974302425236737, 0.32974656309694983, 0.21191941431517314, 0.45233737625533077, 0.5400921777449298]
	//
	// c: [6.4314985814019305, 5.775117227059007, 5.882896453145013, 5.9993999865002525, 7.049639788867431]
	// m: [0.37517123787728746, 0.5688806045988934, 0.41800415074105757, 0.5379396028322475, 0.15469747623109165]
	//
	// c: [6.17438918209313, 6.586714613290054, 6.110432855716649, 7.682801913432204, 6.996800579279657]
	// m: [0.2662684381094578, 0.32483359839424863, 0.21212368426280032, 0.2329798673254509, 0.4341997868694286]
	//
	// c: [6.382843174297131, 7.661897091376906, 7.3380746174978455, 5.843675938884417, 7.099675372260202]
	// m: [0.3467490495615911, 0.21265906253296732, 0.3903680450518938, 0.18381437124899314, 0.2757447911023465]
	//
	// c: [6.9494018089955345, 6.043835990398579, 6.63555023022242, 7.734720384524815, 6.175707898422956]
	// m: [0.29104435447599947, 0.5017095238782959, 0.3427591908109755, 0.49715838174473914, 0.4493386230013131]
	//
	// c: [6.667496914399937, 6.000804515188482, 6.694177086439987, 7.2308079190292744, 5.892995546630628]
	// m: [0.35654552645010706, 0.2189486667443046, 0.5206106696880115, 0.46275237289895566, 0.3156987190092039]
	//
	// c: [7.475573532552337, 7.588532507791021, 6.504967712997945, 6.091058802268411, 6.1843062794059245]
	// m: [0.18714379848926102, 0.20698840635773808, 0.18391880758521256, 0.25654469323098017, 0.5495969437948938]
	//
	// c: [7.833393020694507, 5.964662445215822, 6.605872635688508, 6.3926818078053005, 7.676795571452139]
	// m: [0.3457018518251113, 0.1766123665716355, 0.3086012831036561, 0.20546738770614664, 0.424478781901828]
	//
	// c: [7.926718019089033, 7.728644965964966, 6.395101478519607, 7.150370112463929, 6.225574204502092]
	// m: [0.17444632333803162, 0.16704693476929083, 0.555259983828432, 0.3968475022205177, 0.545956082379335]
	//
	// c: [6.118169553792935, 7.035461227034112, 5.954535761894289, 7.251301689137767, 7.769014107983824]
	// m: [0.3383434521000742, 0.18188588185039395, 0.5371834077481564, 0.32266619042383266, 0.386032730711642]
	//
	// c: [6.798897631361868, 6.3373765359033865, 6.928129298488897, 7.961372406212278, 6.584504002881589]
	// m: [0.2751419441737193, 0.440859959394059, 0.4206895921047329, 0.5049997331591185, 0.19121849844459854]
	this.cFreqArray = [6.798897631361868, 6.3373765359033865, 6.928129298488897, 7.961372406212278, 6.584504002881589];
	this.mFreqArray = [0.2751419441737193, 0.440859959394059, 0.4206895921047329, 0.5049997331591185, 0.19121849844459854];

	for(var i=0; i<this.nShapers; i++){

		this.onGain[i] = {gain: new MyGain(0)};

		this.inGain[i] = {gain: new MyGain(this.inGainArray[i])};
		this.shaper[i] = {shaper: new MyWaveShaper()};
		this.shaper[i].shaper.makeFm(this.cFreqArray[i], this.mFreqArray[i], 1);
		this.outGain[i] = {gain: new MyGain(this.outGainArray[i])};

		this.onConstant.connect(this.on);
		this.on.connect(this.onFilter);
		this.onGain[i].gain.connect(this.inGain[i].gain); this.onFilter.connect(this.onGain[i].gain.gain.gain);
		this.inGain[i].gain.connect(this.shaper[i].shaper);
		this.shaper[i].shaper.connect(this.outGain[i].gain);

	}

	this.onConstant.start();

}

ShaperBank4.prototype = {

	outGain: this.outGain,
	shaper: this.shaper,
	on: this.on,

	nShapers: this.nShapers,

	connectOutput: function(audioNode, idx){

		var idx = idx;

		if (audioNode.hasOwnProperty('input') == 1){
			this.outGain[idx].gain.connect(audioNode.input);
		}
		else {
			this.outGain[idx].gain.connect(audioNode);
		}

	},

	connect: function(audioNode){
		if (audioNode.hasOwnProperty('input') == 1){
			this.output.connect(audioNode.input);
		}
		else {
			this.output.connect(audioNode);
		}
	},

}

//--------------------------------------------------------------

function ELine3(rate, sequenceLength, gainVal){

	this.rate = rate;
	this.sL = sequenceLength;
	this.gainVal = gainVal;

	this.output = audioCtx.createGain();
	this.output.gain.value = this.gainVal;

	// shape line
	this.line = new Instrument();
	this.line.lineShape(this.rate, this.sL);

	// gains
	this.lG = new MyGain(0.2);

	this.line.connect(this.lG);

	this.nFX = 2;
	this.fxG = new MyGain(0.25);

	this.lG.connect(this.fxG);

	this.fx = new MultiEffect(this.nFX);
	this.fx.effects[0].effect.shortDelay();
	this.fx.effects[1].effect.shortDelay();

	for(var i=0; i<this.nFX; i++){
		this.fxG.connect(this.fx.effects[i].effect);
		this.fx.effects[i].effect.connect(this.output);
	}

	this.fxSL = 240;

	this.oSeqArray = [];
	this.divArray = new MyArray([0.8, 0.4, 0.31]);
	this.divArray.multiply(0.25);

	for(var i=0; i<this.fx.nEffects; i++){
		// create a new onset sequence
		this.oSeqArray[i] = new Sequence();
		this.oSeqArray[i].additive(this.fxSL, this.divArray.array);
	}

}

ELine3.prototype = {

	output: this.output,
	line: this.line,
	dL: this.dL,
	dL2: this.dL2,
	fx: this.fx,
	fxG: this.fxG,
	fxSL: this.fxSL,
	oSeqArray: this.oSeqArray,

	start: function(){

		this.line.start();

		for(var i=0; i<this.fx.nEffects; i++){
			for(var j=0; j<this.fxSL; j++){
				// implement onset sequence
				this.fx.effects[i].effect.switchAtTime(randomInt(0, 2), this.oSeqArray[i].sequence[j]);
			}
		}

	},

	stop: function(){

		this.line.stop();

	},

	connect: function(audioNode1, audioNode2){
		if (audioNode1.hasOwnProperty('input') == 1 && audioNode2.hasOwnProperty('input') == 1){

			this.line.connect(audioNode1.input);
			audioNode1.connect(this.fxG);

			this.output.connect(audioNode2.input);
		}
		else {

			this.line.connect(audioNode1);
			audioNode1.connect(this.fxG.input);

			this.output.connect(audioNode2);

		}
	},

}

//--------------------------------------------------------------
