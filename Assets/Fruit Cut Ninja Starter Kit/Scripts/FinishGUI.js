//gui script for finish gui window

#pragma strict
var skin : GUISkin;
var scoreText: GUIText ;
var score: int;
var fenceUpdate: FenceUpdate;

function Awake() {
}

function LoadMenu()
{
	yield WaitForSeconds(1.0);
	Application.LoadLevel("menu");	
}

/*
function RestartLevel()
{
	yield WaitForSeconds(1.0);
	SharedSettings.writeLog("Restart   ", "Yes       ");
	Application.LoadLevel(SharedSettings.loadedLevel);
}
*/

function OnGUI() {
	GUI.skin = skin;
	
	/*
	if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.3,0.075),"Restart")) {
		RestartLevel();
	}
	*/
	
	if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.3,0.075),"Finish")) {
		
		SharedSettings.writeLog("Score     ", score + "       ");
		SharedSettings.writeLog("Game ends ", "Yes       ");
		SharedSettings.loadedLevel = SharedSettings.QuizMenu;
		Application.LoadLevel(5);
		//PlayerPrefs.DeleteAll();
		//SharedSettings.ioWriter.Close();
		//Application.Quit();
		
	}
	if (SharedSettings.loadedLevel == SharedSettings.NEBF_Direct) {
		fenceUpdate.resetFence();
	}
	if (SharedSettings.loadedLevel != SharedSettings.BF_Only) {
		scoreText.text = "Final Points:"+score;
	} else {
		scoreText.text = "Good job!";
	}
}
