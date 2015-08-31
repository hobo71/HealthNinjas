#pragma strict
var skin : GUISkin;


function OnGUI() {
	guiText.text = SharedSettings.score + " / 12 correct!";
	GUI.skin = skin;
	if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.7,0.2,0.1),"Exit")) {
		SharedSettings.writeLog("Quiz score ", SharedSettings.score+"");
		PlayerPrefs.DeleteAll();
		SharedSettings.ioWriter.Close();
		Application.Quit();
	}
	
}
