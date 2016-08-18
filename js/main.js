
var selectors = [audioInputSelect];

function gotDevices(deviceInfos) {
	var values = selectors.map(function(select) {
		return select.value;
	});

	selectors.forEach(function(select) {
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
	});
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label ||
			'microphone ' + (audioInputSelect.length + 1);
			audioInputSelect.appendChild(option);
		} else {
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	}
	selectors.forEach(function(select, selectorIndex) {
		if (Array.prototype.slice.call(select.childNodes).some(function(n) {
			return n.value === values[selectorIndex];
		})) {
			select.value = values[selectorIndex];
		}
	});
}

function initAudio() {
	if (window.stream) {
		window.stream.getTracks().forEach(function(track) {
			track.stop();
		});
	}

	var audioSource = audioInputSelect.value;
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
audioInputSelect.onchange = initAudio;
initAudio();