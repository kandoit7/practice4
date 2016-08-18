
var audioInputSelect1 = document.querySelector('select');
var selectors = [audioInputSelect1];

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
			option.text = deviceInfo.label ||
			'microphone ' + (masterInputSelector.length + 1);
			masterInputSelector.appendChild(option);
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
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
    		audioInputSelect[selector].parentNode.replaceChild(newInputSelector,
        	audioInputSelect[selector]);
  	}
}

function changeAudioDestination(event) {
	var deviceId = event.target.value;
	var outputSelector = event.target;
	var element = event.path[2].childNodes[1];
	attachSinkId(element, deviceId, outputSelector);
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
	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
audioInputSelect1.onchange = initAudio;
initAudio();

