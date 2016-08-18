
var audioInputSelect1 = document.querySelector('select.one');
var audioInputSelect2 = document.querySelector('select.two');
var audioInputSelect3 = document.querySelector('select.three');
var audioInputSelect4 = document.querySelector('select.four');
var selectors = [audioInputSelect1, audioInputSelect2, audioInputSelect3, audioInputSelect4];

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
			'microphone ' + (audioInputSelect1.length + 1);
			audioInputSelect1.appendChild(option);
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

	var audioSource = audioInputSelect1.value;
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotDevices).catch(handleError);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
audioInputSelect1.onchange = initAudio;
initAudio();

