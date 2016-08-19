
var masterInputSelector = document.createElement('select');

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
    var canvas = document.getElementById( "wavedisplayo" );
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
	
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || 'microphone ' + (masterInputSelector.length + 1);
			masterInputSelector.appendChild(option);
		}
	}
	
	var audioInputSelect = document.querySelectorAll('select');
  	for (var selector = 0; selector < audioInputSelect.length; selector++) {
    		var newInputSelector = masterInputSelector.cloneNode(true);
    		newInputSelector.addEventListener('change', changeAudioDestination);
    		audioInputSelect[selector].parentNode.replaceChild(newInputSelector, audioInputSelect[selector]);
  	}
  	
}

function changeAudioDestination(event) {
	var deviceId = event.target.value;
	var element = event.path[2].childNodes[1];
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

function initAudio() {
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
	}

	var audioSource = masterInputSelector.value;
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
	console.log("initAudio");
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
masterInputSelector.onchange = initAudio;
initAudio();

