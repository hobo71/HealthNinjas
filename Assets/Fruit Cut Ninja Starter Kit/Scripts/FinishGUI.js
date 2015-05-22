//gui script for finish gui window

#pragma strict
var skin : GUISkin;
var scoreText: GUIText ;
var score: int;
var bioharnessUpdate: BioharnessUpdate;
var envUpdate: FenceUpdate;

function Awake() {
}

function LoadMenu()
{
	yield WaitForSeconds(1.0);
	Application.LoadLevel("menu");	
}

function RestartLevel()
{
	yield WaitForSeconds(1.0);
	Application.LoadLevel(0);
}

function OnGUI() {
	GUI.skin = skin;
	
	if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.7,0.3,0.075),"Restart")) {
		RestartLevel();
	}
	
	if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.8,0.3,0.075),"Exit")) {
		PlayerPrefs.DeleteAll();
		Application.Quit();
		
	}
	
	scoreText.text = "Final Points:"+score;
}