
var audioInputSelect1 = document.querySelector('select');
var selectors = [audioInputSelect1];

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

function gotBuffers( buffers ) {
    var canvas = document.getElementById( "wavedisplay" );
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
	var masterInputSelector = document.createElement('select');
	/*
	var values = selectors.map(function(select) {
		return select.value;
	});

	selectors.forEach(function(select) {
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
	});
	*/
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		/*
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label ||
			'microphone ' + (audioInputSelect1.length + 1);
			audioInputSelect1.appendChild(option);
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
		*/
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || 'microphone ' + (masterInputSelector.length + 1);
			masterInputSelector.appendChild(option);
		} else {
			console.log('Found non audio input device: ', deviceInfo.label);
		}
	}
	/*
	selectors.forEach(function(select, selectorIndex) {
		if (Array.prototype.slice.call(select.childNodes).some(function(n) {
			return n.value === values[selectorIndex];
		})) {
			select.value = values[selectorIndex];
		}
	});
	*/
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
}

function initAudio() {
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
	}

	var audioSource = audioInputSelect1.value;
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
audioInputSelect1.onchange = initAudio;
initAudio();

