//show couting down before game starts

#pragma strict
var GetReady : GameObject;
var GO : GameObject;
var started : boolean;
//var fpsgo : GameObject;

function Awake() {
	
	//Set game time
	GetComponent(Timer).timeAvailable = SharedSettings.ConfigTime;
	
}

function PrepareRoutine()
{
	yield WaitForSeconds(1.0);
	GetReady.SetActive(true);
	yield WaitForSeconds(2.0);
	GetReady.SetActive(false);
	GO.SetActive(true);
	GetComponent(Timer).RunTimer();
	started = true;
	yield WaitForSeconds(1.0);
	GO.SetActive(false);
}

function Start () {
	//GameObject.Find("GUI/LevelName").GetComponent(GUIText).text = SharedSettings.LevelName[SharedSettings.LoadLevel-1]; 
	PrepareRoutine();
}


