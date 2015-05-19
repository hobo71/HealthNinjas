#pragma strict

var breathTime : float = 6.0f;
var inhaleTime : float = 2.4f;
var exhaleTime : float = breathTime - inhaleTime;

private var minRange : float = 1.8f;
private var maxRange : float = 15.8f;
private var kRangeInhale : float = (maxRange - minRange) / inhaleTime;
private var kRangeExhale : float = (maxRange - minRange) / exhaleTime;

private var minAlpha : float = 50.0f;
private var maxAlpha : float = 255.0f;
private var kAlphaInhale : float = (maxAlpha - minAlpha) / inhaleTime;
private var kAlphaExhale : float = (maxAlpha - minAlpha) / exhaleTime;

var timer: Timer;
var li : Light;

function Start () {
}

function Update () {
	var curTime = timer.curTime % 6;
	if (curTime < inhaleTime) {
		li.range = minRange + kRangeInhale * curTime;
		//li.color.a = minAlpha + kAlphaInhale * curTime;
	} else {
		li.range = maxRange - kRangeExhale * (curTime - inhaleTime);
		//li.color.a = maxAlpha - kAlphaExhale * (curTime - inhaleTime);
	} 
	
}