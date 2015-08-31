#pragma strict

var breathTime : float;
var inhaleTime : float;
var exhaleTime : float;

private var minRange : float = 1.0f;
private var maxRange : float = 12.6f;
private var kRangeInhale : float;
private var kRangeExhale : float;

private var minIntensity : float = 1.0f;
private var maxIntensity : float = 5.4f;
private var kIntensityInhale : float;
private var kIntensityExhale : float;

private var minAlpha : float = 50.0f;
private var maxAlpha : float = 255.0f;
private var kAlphaInhale : float;
private var kAlphaExhale : float;

var timer: Timer;
var li : Light;
private var color : Color;

function Start () {
	color = li.color;
	breathTime = 60 / SharedSettings.targetRR;
	inhaleTime = breathTime * 0.4;
	exhaleTime = breathTime - inhaleTime;
	kRangeInhale = (maxRange - minRange) / inhaleTime;
	kRangeExhale = (maxRange - minRange) / exhaleTime;
	kIntensityInhale = (maxIntensity - minIntensity) / inhaleTime;
	kIntensityExhale = (maxIntensity - minIntensity) / exhaleTime;
}

function Update () {
	var curTime = timer.curTime % breathTime;
	if (curTime < inhaleTime) {
		li.range = minRange + kRangeInhale * curTime;
		li.intensity = minIntensity + kIntensityInhale * curTime;
		//li.color = Color.Lerp(Color.white, Color.yellow, curTime / inhaleTime);
	} else {
		li.range = maxRange - kRangeExhale * (curTime - inhaleTime);
		li.intensity = maxIntensity - kIntensityExhale * (curTime - inhaleTime);
		//li.color = Color.Lerp(Color.yellow, Color.white, (curTime - inhaleTime) / exhaleTime);
	} 
	
}