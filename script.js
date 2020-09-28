let mic, recorder, currentVol, volHistory, micIsRecording, audioPlaying, amp, reverbOn, exportSound, volumeSetting, chorusVoices, buttonsArr, backgroundColor,colorHue, bcolor;

function setup() {
    // Canvas and color settings
    colorMode(HSB, 360, 100, 100);
    let cnv = createCanvas(800, 500);
    cnv.position(50, 240);
    backgroundColor = color(0,50,100);

    // Setting up the mic/recorder
    mic = new p5.AudioIn();
    mic.start();
    recorder = new p5.SoundRecorder();
    recorder.setInput(mic);
    micIsRecording = false;
    audioPlaying = false;

    // Setting up the audio file
		soundFile = new p5.SoundFile();
    
    // Setting up amplitude measurements and creating an array of amplitude levels that will allow us to graph the audio file's amplitude
    amp = new p5.Amplitude();
    volHistory = [];

    // Setting up default effects and edits (turning them off)
		reverbOn = false;
    speedRate = false;
    slowRate = false;
    volumeSetting = 1;
    chorusVoices = 1;

}

function draw() {
    // Setting background color and displaying text on canvas
    background(backgroundColor);
    text(`Volume: ${(int)(volumeSetting * 10)}`, 10, 20);
		text(`Chorus: ${(chorusVoices)}`, 10, 40);
    
    // Records the amplitude of the sound file (recorded or uploaded) and calls the functions to graph the sound file's amplitude and change the background color accordingly
    if (micIsRecording) {
        currentVol = mic.getLevel();
        volHistory.push(currentVol);
        graphAudio();
        changeBackgroundColor();
    } else if (audioPlaying) {
				amp.setInput(soundFile);
        currentVol = amp.getLevel();
        volHistory.push(currentVol);
        graphAudio();
        changeBackgroundColor();
    } else {
        graphAudio();
    }
		
}

// Changes the hue of the canvas based on the audio file's amplitude
function changeBackgroundColor(){
  colorHue = map(currentVol, 0, 1, 0, 360);
  bcolor = color(colorHue, 50, 100);
  backgroundColor = bcolor;
}

// When trim button is clicked, allows the user to specify desired start and stop times of audio file, plays and records shortened audio file, and replaces audio file with the shortened recording
function trimButtonClicked(){
	var start = parseFloat(prompt("Start trim (seconds):"));
	var length = parseFloat(prompt("Trim length (seconds):"));
	alert("Your audio will be played back and recorded, replacing your current loaded audio. Do not interrupt playback.");
	avRecorder = new p5.SoundRecorder();
	avRecorder.setInput();
	exportSound = new p5.SoundFile();
	setTimeout(function(){avRecorder.record(exportSound)}, 1000*start);
	setTimeout(function(){avRecorder.stop()}, 1000*start + 1000*length);
	playButtonClicked();
	soundFile.onended(applyTrim);
}

// Resets the program after trimming is complete
function applyTrim(){
	setup()
	soundFile = exportSound;
	document.getElementById("playStopButton").innerHTML = "play";
	document.getElementById("reverbButton").innerHTML = "reverb (off)";
	document.getElementById("slowDownBtn").innerHTML = "slow (off)";
	document.getElementById("speedUpBtn").innerHTML = "speed (off)";
	soundFile.onended(soundEnd)
}

// When record button is clicked, stops or starts the recording
function recordButtonClicked() {
		soundFile.stop();
	  if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
    // Begins the audio input
    if (!micIsRecording) {
        document.getElementById("recordStopButton").innerHTML = "stop";
        recorder.record(soundFile);
        micIsRecording = true;
    } else if (micIsRecording) {
        recorder.stop();
        micIsRecording = false;
        document.getElementById("recordStopButton").innerHTML = "record";
    }
}

// When upload button is clicked, does nothing (ability to upload is determined by "audioUpload" element in index.html)
function uploadButtonClicked() {
}

// When apply button is clicked, plays and records audio file with effects / edits and replaces audio file with the shortened recording
function applyButtonClicked() {
	alert("Your audio will be played back and recorded, replacing your current loaded audio. Do not interrupt playback.");
	avRecorder = new p5.SoundRecorder();
	avRecorder.setInput();
	exportSound = new p5.SoundFile();
	avRecorder.record(exportSound);
	playButtonClicked();
	soundFile.onended(applyExporter);
}

// Allows user to export audio file and resets appropriate button texts
function applyExporter() {
	avRecorder.stop();
	setup();
	soundFile = exportSound;
	document.getElementById("playStopButton").innerHTML = "play";
	document.getElementById("reverbButton").innerHTML = "reverb (off)";
	document.getElementById("slowDownBtn").innerHTML = "slow (off)";
	document.getElementById("speedUpBtn").innerHTML = "speed (off)";
	soundFile.onended(soundEnd);
}

// When import button is clicked, allows the user to import an audio file from their device
function importButtonClicked() {

		if (document.getElementById("audioUpload").files[0] == undefined){
			alert("Error: You have not uploaded anything yet")
			return
		}

		document.getElementById("importButton").innerHTML = "importing...";
		soundFile = loadSound(document.getElementById("audioUpload").files[0], loaded);
}

// When the file is sucesfully imported, changes the button's text and notifies the user
function loaded() {
		document.getElementById("importButton").innerHTML = "import";
		alert("Audio file successfully imported");
}

// When play button is clicked, plays or stops the audio
function playButtonClicked() {
	if (!audioPlaying) {
		soundFile.play();
    // For each chorus voice added, plays the audio file again 30 milliseconds after the last time it was played
		for (let i=0; i<chorusVoices-1; i++){
    		setTimeout(function(){soundFile.play();}, 30*(i+1));
		}
		audioPlaying = true;
		document.getElementById("playStopButton").innerHTML = "stop";
		soundFile.onended(soundEnd);
	} else if (audioPlaying) {
		soundFile.stop();
		document.getElementById("playStopButton").innerHTML = "play";
	}
}

// When save button is clicked, allows the user to save the audio file to their device
function saveButtonClicked(){
	saveSound(soundFile, "Audio Visualizer");
}

// When sound file finishes playing, resets appropriate variables and button texts
function soundEnd() {
	audioPlaying = false;
	document.getElementById("playStopButton").innerHTML = "play";
}

// Code adapted from The Coding Train's video 17.9
// Graphs the amplitude of the audio file on the canvas
function graphAudio() {
    stroke(0);
    noFill();
    beginShape();
    for (let i = 0; i < volHistory.length; i++) {
        let p = map(volHistory[i], 0, 1, height, 0);
        vertex(i, p);   
    }
    endShape();
    
    // Creates the effect of showing only the most recent amplitudes on the graph using the array.splice() method - removes 1 element at index 0 
    if (volHistory.length > width) {
        volHistory.splice(0, 1);
    }
}

// When reverb button is clicked, adds a reverb effect to the audio file
function reverbEffect(){
	if (reverbOn){
		reverbOn = false;
		document.getElementById("reverbButton").innerHTML = "reverb (off)";
		reEffect.disconnect();
	} else {
		reverbOn = true;
		document.getElementById("reverbButton").innerHTML = "reverb (on)";
		reEffect = new p5.Reverb;
		reEffect.process(soundFile, 10, 10, false);
	}
}

// When chorus + button is clicked, adds another voice to the chorus
function chorusUp(){
	if (!audioPlaying){
		chorusVoices++
	}
}

// When chorus - button is clicked, subtracts another voice to the chorus
function chorusDown() {
	if (chorusVoices > 1 && !audioPlaying){
		chorusVoices--;
	}
}

// When volume + button is clicked, increases the volume of the sound - increments the volume by .1 each time it is clicked
function volumeUp(){
  if (volumeSetting + 0.1 <= 5) {
		volumeSetting += .1;
    soundFile.setVolume(volumeSetting);
  }
}

//When volume - button is clicked, decreases the volume of the sound
function volumeDown(){
  // Making sure the volume is not below 0, then sets the new volume
  if (volumeSetting - 0.1 >= 0) {
		volumeSetting -= .1;
    soundFile.setVolume(volumeSetting);
  }
}

// When speed up button is clicked, speeds up the rate the sound is played at
function speedUp(){

	if (audioPlaying && chorusVoices > 1){
		return
	}

	// Conditional that allows toggling of the button when clicked
  if(speedRate){
    speedRate = false;
    document.getElementById("speedUpBtn").innerHTML = "speed (off)";
		soundFile.rate(1);
  }else{
    speedRate = true;
		slowRate = false;
		document.getElementById("slowDownBtn").innerHTML = "slow (off)";
    document.getElementById("speedUpBtn").innerHTML = "speed (on)";
    // Allows the rate to be greater than one in order to speed up the playback
    let speed = map(0, .01, 1, 2, 0);
    speed = constrain(speed, 0.05, 10);
    soundFile.rate(speed);
  }
}

// When slow down button is clicked, slows down the rate the sound is played at
function slowDown(){

	if (audioPlaying && chorusVoices > 1){
		return
	}
  // Conditional that allows toggling of the button
  if(slowRate){
    slowRate = false;
    document.getElementById("slowDownBtn").innerHTML = "slow (off)";
    soundFile.rate(1);
  }else{
    slowRate = true;
		speedRate = false;
		document.getElementById("speedUpBtn").innerHTML = "speed (off)";
    document.getElementById("slowDownBtn").innerHTML = "slow (on)";
    // Sets the rate below 1 to slow it down
    let slow = map(0, 0.01, .5, 1, 0);
    slow = constrain(slow, 0.01, .5);
    soundFile.rate(slow);
  }
}
