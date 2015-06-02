#pragma strict

var breathTime : float = 5.0f;
var inhaleTime : float = 2.0f;
var exhaleTime : float = breathTime - inhaleTime;

private var minRange : float = 1.0f;
private var maxRange : float = 12.6f;
private var kRangeInhale : float = (maxRange - minRange) / inhaleTime;
private var kRangeExhale : float = (maxRange - minRange) / exhaleTime;

private var minIntensity : float = 1.0f;
private var maxIntensity : float = 5.4f;
private var kIntensityInhale : float = (maxIntensity - minIntensity) / inhaleTime;
private var kIntensityExhale : float = (maxIntensity - minIntensity) / exhaleTime;

private var minAlpha : float = 50.0f;
private var maxAlpha : float = 255.0f;
private var kAlphaInhale : float = (maxAlpha - minAlpha) / inhaleTime;
private var kAlphaExhale : float = (maxAlpha - minAlpha) / exhaleTime;

var timer: Timer;
var li : Light;
private var color : Color;

function Start () {
	color = li.color;
}

function Update () {
	var curTime = timer.curTime % breathTime;
	if (curTime < inhaleTime) {
		li.range = minRange + kRangeInhale * curTime;
		li.intensity = minIntensity + kIntensityInhale * curTime;
		li.color = Color.Lerp(Color.white, Color.yellow, curTime / inhaleTime);
	} else {
		li.range = maxRange - kRangeExhale * (curTime - inhaleTime);
		li.intensity = maxIntensity - kIntensityExhale * (curTime - inhaleTime);
		li.color = Color.Lerp(Color.yellow, Color.white, (curTime - inhaleTime) / exhaleTime);
	} 
	
}