var masterGain;
var fadeFilter;
var dE;
var offlineBuffer;

setTimeout(function(){bufferLoaded();}, 1000);

function bufferLoaded(){

	var gain = audioCtx.createGain();
	gain.gain.value = 4;

	fadeFilter = new FilterFade(0);

	// EFFECTS
	var pSD = new Effect();
	var nDelays = 4;
	var fbArray = new Sequence();
	fbArray.randomFloats(nDelays, 0.1, 0.2);
	fbArray = fbArray.sequence;
	pSD.powerSequenceDelay(nDelays, 2, [-1, -2, -3, -1.1, -1.2], fbArray);
	pSD.on();
	pSD.output.gain.value = 1/(4*nDelays);
	dE = new Envelope([1, 30, 1, (64+32)]);
	var dEG = new MyGain(0);

	var f = new MyBiquad("highpass", 50, 1);

	masterGain = audioCtx.createGain();
	masterGain.connect(gain);

	gain.connect(dEG.input); dE.connect(dEG.gain.gain);
	dEG.connect(pSD);
	pSD.connect(fadeFilter);

	gain.connect(fadeFilter.input);
	fadeFilter.connect(f);
	f.connect(audioCtx.destination);

	// INITIALIZE
	var fund = 432*P5;

	mixerInit();

	initMalletKeys();
	initBassFX();
	initBass();
	initSKPad();
	initMMRibbons();
	initFlutterXylophone();
	initNoiseSynth();

	if(onlineButton.innerHTML == "online"){
		setTimeout(function(){onlineBufferLoaded();}, 1000);
	}

	else if(onlineButton.innerHTML == "offline"){
		offlineBufferLoaded();
	}

}

//--------------------------------------------------------------

function runPatch(){

	fadeFilter.start(1, 50);

	var fund = 432*P5;

		var now = audioCtx.currentTime;

		mixerAutomation(now);

	// // KEY MALLETS
	playMalletKeys(0, 64+16, now);

	// BASS LINE
	bassLineSection(fund, 16, now);

	// SK PAD
	playSKPad(32, now);

	// // KEY RIBBON
	playMMRibbons(48, now, mmKey2, 2, [0.0625]);

	// // XYLOPHONE
	playFlutterXylophone(64, now);

	// 	// NOISE SYNTH
	playNoiseTone(72, now, fund/P5);

	// 	// DELAY FADE
	dE.startAtTime(16+now);

}

//--------------------------------------------------------------

function stopPatch(){

	var now = audioCtx.currentTime;
	fadeFilter.start(0, 20);
	setTimeout(function(){masterGain.disconnect();}, 100);
	startButton.innerHTML = "reset";

	if(onlineButton.innerHTML=="offline"){
		offlineBuffer.stop();
	}

}
//--------------------------------------------------------------

function onlineBufferLoaded(){

	startButton.disabled = false;
	startButton.innerHTML = "start";

}

//--------------------------------------------------------------

function offlineBufferLoaded(){

	runPatch();

	audioCtx.startRendering().then(function(renderedBuffer){

		offlineBuffer = onlineCtx.createBufferSource();
		offlineBuffer.buffer = renderedBuffer

		startButton.disabled = false;
		startButton.innerHTML = "start";

		offlineBuffer.connect(onlineCtx.destination);

	})

}
