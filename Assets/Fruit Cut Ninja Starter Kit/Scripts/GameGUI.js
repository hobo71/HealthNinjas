//gui for game - 2 buttons

#pragma strict
var skin : GUISkin;
private var pause : boolean = false;
var pauseinfo : GameObject;

function Pause() {
	pause = !pause;
	if (pause) {
		GameObject.Find("FruitDispenser").GetComponent(FruitDispenser).pause = true;
		GameObject.Find("MainScripts").GetComponent(Timer).PauseTimer(true);
		pauseinfo.SetActive(true);

		Time.timeScale = 0.0001;
	} else {
		GameObject.Find("FruitDispenser").GetComponent(FruitDispenser).pause = false;
		GameObject.Find("MainScripts").GetComponent(Timer).PauseTimer(false);
		pauseinfo.SetActive(false);

		Time.timeScale = 1.0;
	}

}

function LoadMenu()
{
/*
		GameObject.Find("MainScripts").GetComponent(FadeIn).FadeToBlack();
		yield WaitForSeconds(1.0);
		Application.LoadLevel("menu");	
*/
}

function PauseRB() {
	//freeze fruits
	var objs = GameObject.FindObjectsOfType(Rigidbody);
	for (var obj in objs) {
		obj.rigidbody.Sleep();
	}	
}

function UnPause() {

}

function ExitGame() {
	Application.Quit();
}

function OnGUI() {
	GUI.skin = skin;
	
	if (!GameObject.Find("MainScripts").GetComponent(PrepareLevel).started) 
		GUI.enabled = false;
	
	if (GUI.Button(HelpClass.ScrRectCenter2(0.075,0.965,0.14,0.065),"Exit")) 
		ExitGame();
	if (GUI.Button(HelpClass.ScrRectCenter2(0.925,0.965,0.14,0.065),"Pause")) 
		Pause();
    
    GUI.enabled = true;
    
}
/*
function Update()
{
    // for this example, the bar display is linked to the current time,
    // however you would set this value based on your desired display
    // eg, the loading progress, the player's health, or whatever.
    barDisplay = Time.time * 0.05;
}
*/