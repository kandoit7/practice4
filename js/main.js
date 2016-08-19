
var masterInputSelector = document.createElement('select');

var audioInputSelect = document.querySelector('select#change');
var selectors = [audioInputSelect];

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    audioRecorder = null;
var Track = null;    
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

var inputPoint = audioContext.createGain();
var changeGain = audioContext.createGain();

function gotBuffers( buffers ) {
	console.log(buffers);
   	var canvas = document.getElementById(event.target.previousElementSibling.id);
	//reference audiodisplay.js 
	drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
	// the ONLY time gotBuffers is called is right after a new recording is completed - 
	// so here's where we should set up the download.
	// audioRecorder.exportWAV( doneEncoding );
}


function toggleRecording( e ) {
	if (e.classList.contains("recording")) {
	// stop recording
		audioRecorder.stop();
		e.classList.remove("recording");
		audioRecorder.getBuffers( gotBuffers );
	} else {
	// start recording
		if (!audioRecorder)
	    		return;
		e.classList.add("recording");
		audioRecorder.clear();
		audioRecorder.record();
	}
}

function gotDevices(deviceInfos) {
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
	
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || 'microphone ' + (masterInputSelector.length + 1);
			masterInputSelector.appendChild(option);
		} else {
			//console.log('Some other kind of source/device: ', deviceInfo);
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
	console.log(event);
	initAudio(InputSelector);
}
	
function gotStream(stream) {
	window.stream = stream; // make stream available to console
	// Create an AudioNode from the stream.
	realAudioInput = audioContext.createMediaStreamSource(stream);
	audioInput = realAudioInput;
	audioInput.connect(inputPoint);
	
	//    audioInput = convertToMono( input );
	
	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 2048;
	inputPoint.connect( analyserNode );
	
	audioRecorder = new Recorder( inputPoint );
	// speak / headphone feedback initial settings
	
	changeGain.gain.value = 1.0;
	inputPoint.connect(changeGain);
	changeGain.connect(audioContext.destination);
	
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
	console.log(audioSource);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
//var changeInput = document.querySelectorAll('select#change');
//changeInput.onchange = initAudio;
initAudio(0);

