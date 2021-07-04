var mKG1; var mKG2; var mKG; var mKF; var mKDG;
var bG; var bDG;
var sKT;
var mmRG;
var fXYG; var fXYDG;
var nTG; var nTDG;
var hTG;

function mixerInit(){

	var rD = new MyStereoDelay(0.25, 0.125, 0.2, 1);
	rD.connect(masterGain);

	var lD = new MyStereoDelay(0.25*2, 0.125*3, 0.2, 1);
	lD.connect(masterGain);

	// MALLET KEYS
	mKG1 = new MyGain(1);
	mKG2 = new MyGain(1.7);
	mKG = new MyGain(1);
	mKDG = new MyGain(0);
	mKF = new MyBiquad("lowpass", 22000, 1);

	mKG1.connect(mKG);
	mKG2.connect(mKG);
	mKG.connect(mKF);
	mKF.connect(mKDG)
	mKDG.connect(rD);
	mKF.connect(masterGain);

	// BASS
	bG = new MyGain(1.7);
	bDG = new MyGain(0);

	bG.connect(bDG);
	bDG.connect(rD);
	bG.connect(masterGain);

	// SAW KEY PAD
	sKG = new MyGain(1);
	sKG.connect(masterGain);

	// MM RIBBONS
	mmRG = new MyGain(2.65);
	mmRG.connect(masterGain);

	// FLUTTER XYLOPHONE
	fXYG = new MyGain(1.6);
	fXYDG = new MyGain(0.3);

	fXYG.connect(fXYDG);
	fXYDG.connect(rD);
	fXYG.connect(masterGain);

	// NOISE SYNTH
	nTG = new MyGain(0.75);
	nTDG = new MyGain(1.4);

	nTG.connect(nTDG);
	nTDG.connect(lD);
	nTG.connect(masterGain);

}

function mixerAutomation(now){

	var now = now;

	// MALLET KEY
		mKF.biquad.frequency.setValueAtTime(3000, 16+now);
		mKG.gain.gain.setValueAtTime(0.6500000238418579, 16+now);

		mKF.biquad.frequency.setValueAtTime(2000, 32+now);
		mKG.gain.gain.setValueAtTime(0.4259999797344208, 32+now);
		mKDG.gain.gain.setValueAtTime(0.15, 32+now);

		mKF.biquad.frequency.setValueAtTime(1750, 48+now);
		mKG.gain.gain.setValueAtTime(0.40099998474121094, 48+now);
		mKDG.gain.gain.setValueAtTime(0.25, 48+now);

		mKF.biquad.frequency.setValueAtTime(800, 64+now);
		mKG.gain.gain.setValueAtTime(0.3107499885559082, 64+now);
		mKDG.gain.gain.setValueAtTime(0.4, 64+now);

	// BASS
		bG.gain.gain.setValueAtTime(0.9574999690055847, 32+now);
		bDG.gain.gain.setValueAtTime(0.1, 32+now);

		bG.gain.gain.setValueAtTime(0.8574999690055847, 48+now);
		bDG.gain.gain.setValueAtTime(0.25, 48+now);

		bG.gain.gain.setValueAtTime(0, 64+now);

	// KEY RIBBON
		mmRG.gain.gain.setValueAtTime(2, 64+now);

	// FLUTTER SYNTH
		fXYG.gain.gain.setValueAtTime(1, 72+now)

}

//--------------------------------------------------------------

// MALLET KEYS

//--------------------------------------------------------------

function initMalletKeys(){

	initMalletKey3();
	initMalletKey4();

}

//--------------------------------------------------------------

var sK3;
var dCG3;
var mPGain3;
var mK3FX;

function initMalletKey3(){

	output = audioCtx.createGain();

	var fund = 0.25*432*(P5);
	var c1 = new MyArray([1/M2, M2*2, P5, M6, P5*2]);
	c1 = c1.multiply(fund);

	var rateArray = new MyArray([0.125, 0.25, 0.125, 0.25, 0.125]);
	rateArray.multiply(32);
	rateArray = rateArray.array;

	var panArray = [-1, -0.5, 0, -0.5, -1];

	var nNodes = 5;

	var sawSines = new SawSines2(nNodes, c1, rateArray);
	var multiPan = new MultiPan(panArray);

	var inArray = new Sequence();
	inArray = inArray.duplicates(nNodes, 0.2);

	var outArray = new Sequence();
	outArray = outArray.duplicates(nNodes, 0.01);

	var sB3 = new ShaperBank3(nNodes, inArray, outArray);
	sB3.on.gain.gain.value = 1;

	for(var i=0; i<nNodes; i++){

		sawSines.connectOutput(sB3.onGain[i].gain, i);
		sB3.connectOutput(multiPan.pans[i].pan, i);

	}

	var mPGC3 = new BufferConstant(1);
	mPGain3 = new MyGain(1);
	var mPGF = new MyBiquad("lowpass", 10, 0);
	var mPG = new MyGain(0);

	mPGC3.connect(mPGain3);
	mPGain3.connect(mPGF);

	multiPan.connectAll(mPG); mPGF.connect(mPG.gain.gain);
	// mPG.connect(output);

	// fx

	var dly = new MyStereoDelay(0.25, 0.11, 0.1, 1);
	var dC = new BufferConstant(1);
	dCG3 = new MyGain(0);
	var dCF = new MyBiquad("lowpass", 10, 0);
	var dG = new MyGain(0);

	var oAm1 = new OffsetSquareAM(2.11, 10);
	oAm1.smoothingFilter.biquad.frequency.value = 10;
	var oAm2 = new OffsetSquareAM(0.23, 0.51);
	oAm2.smoothingFilter.biquad.frequency.value = 10;
	var oAm3 = new OffsetSquareAM(0.31, 0.27);
	oAm3.smoothingFilter.biquad.frequency.value = 10;

	var f = new MyBiquad("lowshelf", 2000, 0);
	f.biquad.gain.value = -24;
	var f2 = new MyBiquad("lowpass", 20000, 0);

	dC.connect(dCG3);
	dCG3.connect(dCF);

	// mPG.connect(dly);
	mPG.connect(oAm1);
	oAm1.connect(oAm2);
	oAm2.connect(dly);
	oAm3.connect(dly);
	dly.connect(dG); dCF.connect(dG.gain.gain);
	dG.connect(f);
	f.connect(f2);
	f2.connect(output);

	//

	output.connect(mKG1.input);

	sK3 = sawSines;

	mPGC3.start();
	dC.start();
	oAm1.start();
	oAm2.start();
	oAm3.start();

	// FX TAPS

	var nFX = 8;
	var fxG = new MyGain(1);

	mK3FX = new MultiEffect(nFX);
	mK3FX.effects[0].effect.filterPan();
	mK3FX.effects[1].effect.filterPan();
	mK3FX.effects[2].effect.filterPan();
	mK3FX.effects[3].effect.filterPan();
	mK3FX.effects[4].effect.filterPan();
	mK3FX.effects[5].effect.filterPan();
	mK3FX.effects[6].effect.filterPan();
	mK3FX.effects[7].effect.filterPan();

	f2.connect(fxG);

	for(var i=0; i<nFX; i++){
		fxG.connect(mK3FX.effects[i].effect);
		mK3FX.effects[i].effect.connect(output);
	}

}

//--------------------------------------------------------------

var sK4;
var dCG4;
var mPGain4;

function initMalletKey4(){

	output = audioCtx.createGain();

	var fund = 0.25*432*(P5);
	var c1 = new MyArray([1/M2, M2*2, P5, M6, P5*2]);
	c1 = c1.multiply(fund);

	var rateArray = new MyArray([0.125, 0.25, 0.125, 0.25, 0.125]);
	rateArray.multiply(32);
	rateArray = rateArray.array;

	var panArray = [-1, -0.5, 0, -0.5, -1];

	var nNodes = 5;

	var sawSines = new SawSines2(nNodes, c1, rateArray);
	var multiPan = new MultiPan(panArray);

	var inArray = new Sequence();
	inArray = inArray.duplicates(nNodes, 0.2);

	var outArray = new Sequence();
	outArray = outArray.duplicates(nNodes, 0.01);

	var sB4 = new ShaperBank4(nNodes, inArray, outArray);
	sB4.on.gain.gain.value = 1;

	for(var i=0; i<nNodes; i++){

		sawSines.connectOutput(sB4.onGain[i].gain, i);
		sB4.connectOutput(multiPan.pans[i].pan, i);

	}

	var mPGC4 = new BufferConstant(1);
	mPGain4 = new MyGain(1);
	var mPGF = new MyBiquad("lowpass", 10, 0);
	var mPG = new MyGain(0);

	mPGC4.connect(mPGain4);
	mPGain4.connect(mPGF);

	multiPan.connectAll(mPG); mPGF.connect(mPG.gain.gain);
	// mPG.connect(output);

	// fx

	var dly = new MyStereoDelay(0.25, 0.11, 0.1, 1);
	var dC = new BufferConstant(1);
	dCG4 = new MyGain(0);
	var dCF = new MyBiquad("lowpass", 10, 0);
	var dG = new MyGain(0);

	var oAm1 = new OffsetSquareAM(2.11, 10);
	oAm1.smoothingFilter.biquad.frequency.value = 10;
	var oAm2 = new OffsetSquareAM(0.23, 0.51);
	oAm2.smoothingFilter.biquad.frequency.value = 10;
	var oAm3 = new OffsetSquareAM(0.31, 0.27);
	oAm3.smoothingFilter.biquad.frequency.value = 10;

	var f = new MyBiquad("highpass", 500, 0);
	f.biquad.gain.value = -24;
	var f2 = new MyBiquad("lowpass", 8000, 0);

	dC.connect(dCG4);
	dCG4.connect(dCF);

	// mPG.connect(dly);
	mPG.connect(oAm1);
	oAm1.connect(oAm2);
	oAm2.connect(dly);
	oAm3.connect(dly);
	dly.connect(dG); dCF.connect(dG.gain.gain);
	dG.connect(f);
	f.connect(f2);
	f2.connect(output);

	//

	output.connect(mKG2.input);

	sK4 = sawSines;

	mPGC4.start();
	dC.start();
	oAm1.start();
	oAm2.start();
	oAm3.start();

}

//--------------------------------------------------------------

// BASS

//--------------------------------------------------------------

var eB;
var eBFX1A;

function initBassFX(){

	var output =  audioCtx.createGain();
	output.gain.value = 0.2;

	// FX TAPS

	var nFX = 2;

	eBFX1A = new MultiEffect(nFX);
	eBFX1A.effects[0].effect.shortDelay2();
	eBFX1A.effects[1].effect.shortDelay2();


	// PRINT DELAY VALUES

	for(var i=0; i<nFX; i++){

		eBFX1A.effects[i].effect.output.gain.value = 1/nFX;
		eBFX1A.effects[i].effect.connect(output);

	}

	output.connect(bG.input);

}

//--------------------------------------------------------------

function initBass(){

	var output = audioCtx.createGain();
	output.gain.value = 0.125;

	// SOURCE

	eB = new EPBass([6, 5, 5], [26, 25, 21]);
	eB.output.gain.value = 0.5; // 0.4
	eB.start();

	var f = new MyBiquad("highpass", 80, 0);

	var fxG = new MyGain(1);

	eB.connect(f);
	f.connect(output);

	// FX CONNECTIONS

	f.connect(fxG);

	for(var i=0; i<eBFX1A.nEffects; i++){
		fxG.connect(eBFX1A.effects[i].effect);
	}

	output.connect(bG.input);

}


function bassSequence(startTime, now, inst, sequenceLength, fund, iArray, onsetBase, onsetExpArray, durationBase, durationExpArray, timbreMin, timbreMax){

	var startTime = startTime;
	var now = now;

	var inst = inst;

	// write sequences

	var fund = fund;
	var iArray = iArray;
	var sL = sequenceLength;

	var onsetBase = onsetBase;
	var onsetExpArray = onsetExpArray;

	var durationBase = durationBase;
	var durationExpArray = durationExpArray;

	var timbreMin = timbreMin;
	var timbreMax = timbreMax;

	var oSeq = new Sequence();
	var pSeq = new Sequence();
	var octSeq = new Sequence();
	var dSeq = new Sequence();
	var tSeq = new Sequence();

	oSeq.additivePowers(sL, onsetBase, onsetExpArray);
	pSeq.randomSelect(sL, iArray);
	pSeq.multiply(fund);
	octSeq.randomPowers(sL, 2, [-1, -2]);
	dSeq.randomPowers(sL, durationBase, durationExpArray);
	tSeq.randomFloats(sL, timbreMin, timbreMax);

	oSeq = oSeq.sequence;
	octSeq = octSeq.sequence;
	pSeq = pSeq.sequence;
	dSeq = dSeq.sequence;
	tSeq = tSeq.sequence;

	// play

	for(var i=0; i<sL; i++){
		inst.timbreGain.gain.gain.value = tSeq[i];
		inst.playAtTime(startTime+now+oSeq[i], pSeq[i]*octSeq[i], dSeq[i]);
	}

}

//--------------------------------------------------------------

function fxSequence(startTime, now, mFX, sequenceLength){

	var startTime = startTime;
	var now = now;

	var mFX = mFX;
	var sequenceLength = sequenceLength;

	var oSeqArray = [];
	var divArray = new MyArray([0.8, 0.4, 0.31]);
	divArray.multiply(0.5);
	divArray = divArray.array;

	for(var i=0; i<mFX.nEffects; i++){
		// create a new onset sequence
		oSeqArray[i] = new Sequence();
		oSeqArray[i].additive(sequenceLength, divArray);

		for(var j=0; j<sequenceLength; j++){
			// implement onset sequence
			mFX.effects[i].effect.switchAtTime(randomInt(0, 2), startTime+now+oSeqArray[i].sequence[j]);
		}
	}
}

//--------------------------------------------------------------

// SK PAD

//--------------------------------------------------------------

var sK2;
var dCG2;
var mPG2ain2;
var sKFF2;
var mPG2;
var mPGG2;
var fx;
var fx2;
var f;
var dE;

var oG1;
var oG2;
var oG3;

var oAmG1;
var oAmG2;

function initSKPad(fund){

	output = audioCtx.createGain();
	output.gain.value = 4.5;

	var fund = fund;

	var nNodes = 5;

	var rateArray = new Sequence();
	rateArray.randomFloats(nNodes, 0.125, 0.25);
	rateArray.multiply(1);
	rateArray = rateArray.sequence;

	var sawSines = new SawSines(nNodes, cArray[0], rateArray);
	var multiPan = new MyGain(1);

	var inArray = new Sequence();
	inArray = inArray.duplicates(nNodes, 0.2);

	var outArray = new Sequence();
	outArray = outArray.duplicates(nNodes, 0.01);

	var sB2 = new ShaperBank(nNodes, inArray, outArray);
	sB2.on.gain.gain.value = 1;

	for(var i=0; i<nNodes; i++){

		sawSines.connectOutput(sB2.onGain[i].gain, i);
		sB2.connectOutput(multiPan, i);

	}

	var mPG2C2 = new BufferConstant(1);
	mPG2ain2 = new MyGain(1);
	var mPG2F = new MyBiquad("lowpass", 10, 0);
	mPG2 = new Effect();
	mPG2.thru2();
	mPG2.on();

	mPG2C2.connect(mPG2ain2);
	mPG2ain2.connect(mPG2F);

	multiPan.connect(mPG2); mPG2F.connect(mPG2.output.gain);

	// oAm

	var oAm1 = new OffsetSquareAM2(randomFloat(0.25, 1), randomFloat(0.25, 1), randomFloat(0.1, 0.8), randomFloat(0.5, 0.8));
	var oAm2 = new OffsetSquareAM2(randomFloat(0.1, 0.3), randomFloat(0.2, 0.5), randomFloat(0.1, 0.8), randomFloat(0.5, 0.8));
	var oAm3 = new OffsetSquareAM2(randomFloat(0.1, 0.3), randomFloat(0.2, 0.5), randomFloat(0.1, 0.8), randomFloat(0.5, 0.8));

	oAm1.smoothingFilter.biquad.frequency.value = randomInt(2, 11);
	oAm2.smoothingFilter.biquad.frequency.value = randomInt(2, 11);
	oAm3.smoothingFilter.biquad.frequency.value = randomInt(2, 11);

	// fx

	var dly = new MyStereoDelay(0.25, 0.11, 0.2, 1);
	var dly2 = new MyStereoDelay(0.4, 0.55, 0.25, 1);
	var dC = new BufferConstant(1);
	dCG2 = new MyGain(0);
	var dCF = new MyBiquad("lowpass", 10, 0);
	var dG = new MyGain(0);

	f = new MyBiquad("lowshelf", 500, 0);
	f.biquad.gain.value = -12;
	var f2 = new MyBiquad("highpass", 51, 0);
	var f3 = new MyBiquad("lowpass", 6300, 0);

	dE = new Envelope([0, 10, 0, 100]);
	var dEG = new MyGain(0);

	dE.connect(dEG.gain.gain);

	dC.connect(dCG2);
	dCG2.connect(dCF);

	oAmG1 = new MyGain(1);
	oAmG2 = new MyGain(0);

	mPG2.connect(oAm1);
	oAm1.connect(oAm2);
	oAm1.connect(oAm3);

	oAm2.connect(oAmG1);
	oAm3.connect(oAmG1);

	oAm2.connect(oAmG2);
	oAm3.connect(oAmG2);

	oAmG1.connect(dly);
	oAmG2.connect(f);

	dly.connect(dG); dCF.connect(dG.gain.gain);
	dG.connect(f); dG.connect(dly2);
	dly2.connect(dEG);
	dEG.connect(f);
	f.connect(f2);
	f2.connect(f3);
	f3.connect(output);

	mPGG2 = new FilterFade(0);

	mPG2.connect(mPGG2);
	mPGG2.connect(output);

	//

	sKFF2 = new FilterFade(0);
	oG1 = new MyGain(0);

	output.connect(sKFF2.input);
	sKFF2.connect(oG1);

	sK2 = sawSines;

	mPG2C2.start();
	dC.start();
	oAm1.start();
	oAm2.start();
	oAm3.start();

	//-----------------------------------

	var nFX = 4;
	var fxG = new MyGain(1);
	var fxG2 = new MyGain(1);

	sKFF2.connect(fxG);
	sKFF2.connect(fxG2);
	oG2 = new MyGain(1);
	oG3 = new MyGain(1);

	fx = new MultiEffect(nFX);
	fx.effects[0].effect.shortDelay();
	fx.effects[1].effect.shortDelay();
	fx.effects[2].effect.shortDelay();
	fx.effects[3].effect.shortDelay();


	for(var i=0; i<nFX; i++){
		fxG.connect(fx.effects[i].effect);
		fx.effects[i].effect.output.gain.value = 1/nFX;
		fx.effects[i].effect.connect(oG2);
	}

	//-----------------------------------

	var nFX2 = 4;

	fx2 = new MultiEffect(nFX2);
	fx2.effects[0].effect.echo();
	fx2.effects[1].effect.echo();
	fx2.effects[2].effect.echo();
	fx2.effects[3].effect.echo();


	for(var i=0; i<nFX; i++){
		fxG2.connect(fx2.effects[i].effect);
		fx2.effects[i].effect.output.gain.value = 1/nFX2;
		fx2.effects[i].effect.connect(oG3);
	}

	//-----------------------------------

	oG1.gain.gain.value = 0;
	oG2.gain.gain.value = 1;
	oG3.gain.gain.value = 1;

	oG1.connect(sKG);
	oG2.connect(sKG);
	oG3.connect(sKG);

}

//--------------------------------------------------------------

// MM RIBBONS

//--------------------------------------------------------------

var mmKey2;
var mmKeyFade2;
var dR1A;
var dR2A;
var dR3A;

function initMMRibbons(){

	var output = audioCtx.createGain();
	output.gain.value = 3;

	mmKey2 = new MoogXylophone();
	mmKey2.trXylophone();

	var f = new MyBiquad("highpass", 500, 1);
	var f2 = new MyBiquad("highpass", 1000, 1);

	var dly = new MyStereoDelay(0.25, 0.125, 0.3, 1);
	var dG = new MyGain(0.4);
	var dly2 = new MyStereoDelay(0.4, 0.325, 0.3, 1);
	var dG2 = new MyGain(0.4);

	var wG = new MyGain(0.1);
	var w = new MyWaveShaper();
	w.makeFm(5, 0.4, 1);
	var wOG = new MyGain(0.1)

	mmKeyFade2 = new FilterFade(0.01);

	mmKey2.connect(f);

	dR1A = new LFO(0, 1, 0.25);
	dR1A.buffer.makeInverseSawtooth(32);
	var dRF1 = new MyBiquad("lowpass", 5, 0);
	var dRG1 = new MyGain(0);

	dR2A = new LFO(0, 1, 0.21);
	dR2A.buffer.makeInverseSawtooth(32);
	var dRF2 = new MyBiquad("lowpass", 5, 0);
	var dRG2 = new MyGain(0);

	dR3A = new LFO(0, 1, 0.17);
	dR3A.buffer.makeSawtooth(16);
	var dRF3 = new MyBiquad("lowpass", 5, 0);
	var dRG3 = new MyGain(0);

	dR1A.connect(dRF1);
	dR2A.connect(dRF2);
	dR3A.connect(dRF3);

	f.connect(dRG1); dRF1.connect(dRG1.gain.gain);
	dRG1.connect(dG);

	f.connect(dRG2); dRF2.connect(dRG2.gain.gain);
	dRG2.connect(dG);

  f.connect(dRG3); dRF3.connect(dRG3.gain.gain);
  dRG3.connect(dG2);

	dG.connect(dly);
	dly.connect(wG);

	dG2.connect(dly2);
	dly2.connect(wG);

	wG.connect(w);
	w.connect(wOG);
	wOG.connect(f2);
	f2.connect(output);

	output.connect(mmRG.input);

}

//--------------------------------------------------------------

// FLUTTER XYLOPHONE

//--------------------------------------------------------------

var mm;

function initFlutterXylophone(){

	var output = audioCtx.createGain();
	output.gain.value = 0.003;

	mm = new MoogXylophone();
	mm.trXylophone();

	var dly = new MyStereoDelay(0.0625, 0.125, 0.4, 1);
	var f = new MyBiquad("highpass", 500, 0);
	var w = new MyWaveShaper();
	w.makeFm(400, 200, 1);
	var wGain = new MyGain(0.1);

	// oAm

	var oAm = new OffsetSquareAM(0.32, 0.5);
	var oAm2 = new OffsetSquareAM(0.21, 0.13);

	var fade  = new MyBuffer(1, 1, audioCtx.sampleRate);
	fade.playbackRate = 10;
	fade.loop="true";
	fade.makeSawtooth(8);
	var fG = new MyGain(0);
	var fGG = new MyGain(10);

	mm.connect(fG); fade.connect(fG.gain.gain);
	fG.connect(fGG);
	fGG.connect(wGain);

	mm.connect(wGain);
	wGain.connect(w);

	w.connect(dly);
	dly.connect(oAm);
	oAm.connect(oAm2);
	oAm2.connect(output);

	output.connect(fXYG.input);

	oAm.start();
	oAm2.start();
	fade.start();

}

//--------------------------------------------------------------

// NOISE SYNTH

//--------------------------------------------------------------

var nT;
var nTP;

function initNoiseSynth(){

	var output = audioCtx.createGain();
	output.gain.value = 1;

	var fund = 432;
	var eArray = [1, 1, 0.1, 1.5, 0, 0.6];

	// INSTRUMENTS
	nT = new Instrument();
	nT.noiseSynth(fund, fund, eArray);

	nTP = new MyPanner2(0);
	var w = new MyWaveShaper();
	w.makeSigmoid(20);

	// CONNECTIONS

	nT.connect(nTP);
	nTP.connect(w);
	w.connect(output);
	output.connect(nTG.input);

}
