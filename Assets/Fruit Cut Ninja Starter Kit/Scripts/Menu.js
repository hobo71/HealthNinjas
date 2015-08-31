#pragma strict
import System.IO;
var skin : GUISkin;


function OnGUI() {
	GUI.skin = skin;
	
	if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.55,0.2,0.075),"Start")) {
		SharedSettings.writeLog("Start quiz", "Yes       ");
		Application.LoadLevel(6);
	} 
}