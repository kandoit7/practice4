
var masterInputSelector = document.createElement('select');

//var audioInputSelect = document.querySelector('select#change');
//var selectors = [audioInputSelect];

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
//var audioInput = null;
var audioRecorder = null;
//var realAudioInput = null;
var Track = null;    
var rafID = null;
var canvasID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var lrecord = null;
var firstlink = null;
var tracklink = null;
var recordRecorder = null;
var record2Recorder = null;
var record3Recorder = null;
var record4Recorder = null;

function gotBuffers( buffers ) {
	var ci = "c"+canvasID;
   	var canvas = document.getElementById(ci);
	//reference audiodisplay.js 
	drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
	// the ONLY time gotBuffers is called is right after a new recording is completed - 
	// so here's where we should set up the download.
	audioRecorder.exportWAV( doneEncoding );
}

function play( e ) {
	console.log(e);
	var tracklink = document.createElement('a');
	tracklink.id = lrecord;
	tracklink.href = link.href;
	e.appendChild(tracklink);
	var track = new Audio(tracklink.href);
	track.play();
}

function down() {
}

function toggleRecording( e ) {
	canvasID = e.id;
	var imgchange = e;
	
	
	console.log(audioRecorder);
	
	if (e.classList.contains("recording")) {
	// stop recording
		audioRecorder.stop();
		e.classList.remove("recording");
		audioRecorder.getBuffers( gotBuffers );
		imgchange.src = 'images/mic.png'
		link = document.getElementById('save');
		lrecord = "l" + e.id;
	} else {
	// start recording  
		//if (!recorderr)
	    	//	return;
	
		if(canvasID == "record") { audioRecorder = recordRecorder; }
		if(canvasID == "record2") { audioRecorder = record2Recorder; }
		if(canvasID == "record3") { audioRecorder = record3Recorder; }
		if(canvasID == "record4") { audioRecorder = record4Recorder; }
		e.classList.add("recording");
		audioRecorder.clear();
		audioRecorder.record();
		imgchange.src = 'images/micrec.png'
	}
}

function doneEncoding( blob ) {
    Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
}

function gotDevices(deviceInfos) {
	/*
	var values = selectors.map(function(select) {
		return select.value;
	});
	selectors.forEach(function(select) {
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
	});
	selectors.forEach(function(select, selectorIndex) {
		if (Array.prototype.slice.call(select.childNodes).some(function(n) {
			return n.value === values[selectorIndex];
		})) {
			select.value = values[selectorIndex];
		}
	});
	*/
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || 'microphone ' + (masterInputSelector.length + 1);
			masterInputSelector.appendChild(option);
		}
	}
	
	var audioInputSelect = document.querySelectorAll('select#change');
	for ( var selector = 0; selector < audioInputSelect.length; selector++) {
		var newInputSelector = masterInputSelector.cloneNode(true);
		newInputSelector.addEventListener('change', changeAudioDestination);
		audioInputSelect[selector].parentNode.replaceChild(newInputSelector, audioInputSelect[selector]);
	}
}
	
function changeAudioDestination(event) {
	var InputSelector = event.path[0];
	initAudio(InputSelector);
}
	
function gotStream(stream) {
	window.stream = stream; // make stream available to console
	
	// Create an AudioNode from the stream.
	var realAudioInput = audioContext.createMediaStreamSource(stream);
	var audioInput = realAudioInput;
	
	var inputPoint = audioContext.createGain();
	inputPoint.gain.value = 1.0;
	audioInput.connect(inputPoint);
	//audioInput = convertToMono( input );
	
	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 2048;
	inputPoint.connect( analyserNode );
	
	var audioRecorder = new Recorder( inputPoint ); // this fuck what the fuck
	if ( recordRecorder == null ) { recordRecorder = audioRecorder; }
	if ( recordRecorder == audioRecorder || record2Recorder == null ) { record2Recorder = audioRecorder; }
	if ( record2Recorder == audioRecorder || record3Recorder == null ) { record3Recorder = audioRecorder; }
	if ( record3Recorder == audioRecorder || record4Recorder == null ) { record4Recorder = audioRecorder; }
	// speak / headphone feedback initial settings
	
	//changeGain.gain.value = 1.0;
	//inputPoint.connect(changeGain);
	//changeGain.connect(audioContext.destination);
	inputPoint.connect(audioContext.destination);
	
	return navigator.mediaDevices.enumerateDevices();
}
	
function initAudio(index) {
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
	}
	
	var audioSource = index.value;
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
initAudio(0);

