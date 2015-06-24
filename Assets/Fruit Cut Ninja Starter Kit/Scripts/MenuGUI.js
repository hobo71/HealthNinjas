#pragma strict
import System.IO;
var skin : GUISkin;
var loadingText : GUIText;
var SharedSettings : SharedSettings;
var hSliderValue : float = 0.0;
var async : AsyncOperation;
var loading : boolean = false;
var userId : String = "";
var idDone : boolean = false;


function OnGUI() {
	GUI.skin = skin;
	
	if (!idDone) { //input user id
		GUI.Label(HelpClass.ScrRectCenter2(0.4,0.3,0.2,0.15), "Please input user id");
		userId = GUI.TextField(HelpClass.ScrRectCenter2(0.5,0.45,0.2,0.12), userId);
		if (userId != "" && GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.2,0.075),"Ok")) {
			idDone = true;
		}
	} 
	else if (!loading){ //show options
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.3,0.3,0.075),"NE+BF Direct - Fence")) {
			SharedSettings.loadedLevel = SharedSettings.NEBF_Direct;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
		
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.4,0.3,0.075),"NE+BF Indirect - Proportion")) {
			SharedSettings.loadedLevel = SharedSettings.NEBF_Indirect;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
		
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.5,0.3,0.075),"NE Control - Bombs")) {
			SharedSettings.loadedLevel = SharedSettings.NE_Control;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
		
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.3,0.075),"BF Only - Fence")) {
			SharedSettings.loadedLevel = SharedSettings.BF_Only;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
	} else { //loading screen
		loadingText.text = "Loading: " + Mathf.Round(hSliderValue*100) + "%";
		//hSliderValue = GUI.HorizontalSlider (HelpClass.ScrRectCenter2(0.5,0.7,0.5,0.5), hSliderValue, 0.0, 1.0);
	}
	
}

function ClickAsync(level : int) {
	loadingText.enabled = true;
	loading = true;
    StartCoroutine(LoadLevelWithBar(level));
}


function LoadLevelWithBar (level : int) {
	async = Application.LoadLevelAsync(level);
	InitLog(level);
    while (!async.isDone) {
    	hSliderValue = async.progress;
    	yield;
    }
}

function InitLog(level : int){
	var t: System.DateTime = System.DateTime.Now;
    var date : String = String.Format("{0:D4}-{1:D2}-{2:D2}-{3:D2}-{4:D2}-{5:D2}", t.Year, t.Month, t.Day, t.Hour, t.Minute, t.Second);
	var fileName : String = userId + "_" + SharedSettings.conditions[level] + "_" + date + ".txt";
	SharedSettings.ioWriter = new StreamWriter(Application.persistentDataPath + "/" + fileName);
    SharedSettings.ioWriter.Flush();
	//var FRead = new File.OpenText(filePath + fileName + ".txt");
}

