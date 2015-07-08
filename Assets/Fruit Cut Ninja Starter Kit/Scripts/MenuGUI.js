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
var confirmBH : boolean = false;
//bioharness
var bioharness : BioharnessUpdate;
//
var dbfTexture : Texture;
var ibfTexture : Texture;
var necTexture : Texture;
var bfoTexture : Texture;


function OnGUI() {
	GUI.skin = skin;
	
	if (!idDone) { //1. input user id
		GUI.Label(HelpClass.ScrRectCenter2(0.4,0.3,0.2,0.15), "Please input user id");
		userId = GUI.TextField(HelpClass.ScrRectCenter2(0.5,0.45,0.2,0.12), userId);
		if (userId != "" && GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.3,0.1),"Confirm")) {
			idDone = true;
		}
	} else if (!bioharness.isConnected && !bioharness.isConnecting) { //2. hit connect button
		GUI.Label(HelpClass.ScrRectCenter2(0.35,0.3,0.2,0.15), "Please connect the sensor");
		if (GUI.Button(HelpClass.ScrRectCenter2(0.510,0.510,0.3,0.1),"Connect") ){
			bioharness.Connect();
		}
	} else if (!bioharness.isConnected) { //3. show connecting message...
		GUI.Label(HelpClass.ScrRectCenter2(0.510,0.85,0.3,0.1), "Connecting...");
	} else if (!confirmBH){ //4. confirm connection
		GUI.Label(HelpClass.ScrRectCenter2(0.45,0.3,0.2,0.15), "Connected to: " + bioharness.bhName);
		if (GUI.Button(HelpClass.ScrRectCenter2(0.510,0.510,0.3,0.1),"Confirm") ){
			confirmBH = true;
		}
	} else if (!loading){ //5. show game scene options
		GUI.Label(HelpClass.ScrRectCenter2(0.4,0.15,0.2,0.15), "Please choose a game");
		
		//"BF Direct - Fence"
		if (GUI.Button(HelpClass.ScrRectCenter2(0.3,0.4,0.3,0.3), dbfTexture)) {
			SharedSettings.loadedLevel = SharedSettings.NEBF_Direct;
			ClickAsync(SharedSettings.loadedLevel);
		}
		//GUI.Label(HelpClass.ScrRectCenter2(0.3,0.55,0.2,0.15), "BF Game");
		
		//"BF Indirect - Ratio"
		if (GUI.Button(HelpClass.ScrRectCenter2(0.7,0.4,0.3,0.3), ibfTexture)) {
			SharedSettings.loadedLevel = SharedSettings.NEBF_Indirect;
			ClickAsync(SharedSettings.loadedLevel);
		}
		//GUI.Label(HelpClass.ScrRectCenter2(0.7,0.55,0.2,0.15), "BF Game");
		
		//"NE Control - Bombs"
		if (GUI.Button(HelpClass.ScrRectCenter2(0.3,0.75,0.3,0.3), necTexture)) {
			SharedSettings.loadedLevel = SharedSettings.NE_Control;
			ClickAsync(SharedSettings.loadedLevel);
		}
		//GUI.Label(HelpClass.ScrRectCenter2(0.3,0.85,0.2,0.15), "NE Control");
		
		//"BF Only - Fence"
		if (GUI.Button(HelpClass.ScrRectCenter2(0.7,0.75,0.3,0.3), bfoTexture)) {
			SharedSettings.loadedLevel = SharedSettings.BF_Only;
			ClickAsync(SharedSettings.loadedLevel);
		}
		//GUI.Label(HelpClass.ScrRectCenter2(0.7,0.85,0.2,0.15), "BF Only");
	} else { //6. show loading screen
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
	var fileName : String = userId + "_" + SharedSettings.conditions[level] + "_" 
	                        + bioharness.bhName + "_" + date + ".txt";
	SharedSettings.ioWriter = new StreamWriter(Application.persistentDataPath + "/" + fileName);
    SharedSettings.ioWriter.Flush();
	//var FRead = new File.OpenText(filePath + fileName + ".txt");
}

