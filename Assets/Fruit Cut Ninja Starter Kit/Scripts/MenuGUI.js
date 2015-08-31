#pragma strict
import System.IO;
var skin : GUISkin;
var loadingText : GUIText;
var calibrationText : GUIText;
var calibrationTime : float = 0.0;
var SharedSettings : SharedSettings;
var hSliderValue : float = 0.0;
var async : AsyncOperation;
var loading : boolean = false;
var showCalibrationResult : boolean = false;
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

function Awake() {
	//temp log
	
}


function OnGUI() {
	GUI.skin = skin;
	if (!idDone) { //1. input user id
		GUI.Label(HelpClass.ScrRectCenter2(0.4,0.3,0.2,0.15), "Please input user ID");
		userId = GUI.TextField(HelpClass.ScrRectCenter2(0.5,0.45,0.2,0.12), userId);
		if (userId != "" && GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.3,0.1),"Confirm")) {
			idDone = true;
		}
	} 
	/* CONNECT BIOHARNESS */
	else if (!bioharness.isConnected && !bioharness.isConnecting) { //2. hit connect button
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
	} 
	/* CALIBRATION */
	else if (!bioharness.isCalibrated && !bioharness.isCalibrating) { //5. calibrate deep breathing rate	
		GUI.Label(HelpClass.ScrRectCenter2(0.35,0.3,0.2,0.15), "Please do deep breathing");
		if (GUI.Button(HelpClass.ScrRectCenter2(0.510,0.510,0.3,0.1),"Start") ){
			StartCalibration();
		}
	} else if (!bioharness.isCalibrated) { //5.1 show calibration progress
		calibrationText.text = "Time: " + Mathf.Round(calibrationTime) + "s";
	} else if (!showCalibrationResult) { //5.1 show calibration result
		GUI.Label(HelpClass.ScrRectCenter2(0.33,0.3,0.2,0.15), "Target breathing rate: " + SharedSettings.targetRR);
		if (GUI.Button(HelpClass.ScrRectCenter2(0.510,0.510,0.3,0.1),"Ok") ){
			showCalibrationResult = true;
		}
	} 
	/* SELECT GAME */
	else if (!loading){ //6. show 4 game options
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
	} else { //6.1 show loading screen
		loadingText.text = "Loading: " + Mathf.Round(hSliderValue * 100) + "%";
		//hSliderValue = GUI.HorizontalSlider (HelpClass.ScrRectCenter2(0.5,0.7,0.5,0.5), hSliderValue, 0.0, 1.0);
	}
	
}

function ClickAsync(level : int) {
	loadingText.enabled = true;
	loading = true;
    StartCoroutine(LoadLevelProgress(level));
}


function LoadLevelProgress (level : int) {
	async = Application.LoadLevelAsync(level);
	InitLog(level);
    while (!async.isDone) {	
    	hSliderValue = async.progress;
    	yield;
    }
}

function StartCalibration() {
	//SharedSettings.writeLog("Calibrate Low", "Start");
	calibrationText.enabled = true;
	bioharness.isCalibrating = true;
	calibrationTime = 0;
	StartCoroutine(CalibrationProgress());
}

function CalibrationProgress() {	
    while (calibrationTime < SharedSettings.CalibrationTime) {	
    	calibrationTime += Time.deltaTime;
    	yield;
    }
    bioharness.isCalibrating = false;
    bioharness.isCalibrated = true;
    //get low BR
    SharedSettings.targetRR = bioharness.getTargetRate();
    SharedSettings.transitRR = SharedSettings.targetRR + 6;
    //SharedSettings.writeLog("Target BR", SharedSettings.targetRR+"");
    Debug.Log("Target BR: " + SharedSettings.targetRR);
    Debug.Log("High BR: " + SharedSettings.transitRR);
    bioharness.calibrationSeconds = 0;
    calibrationText.enabled = false;
}

function InitLog(level : int){
	var t: System.DateTime = System.DateTime.Now;
    var date : String = String.Format("{0:D4}-{1:D2}-{2:D2}-{3:D2}-{4:D2}-{5:D2}", t.Year, t.Month, t.Day, t.Hour, t.Minute, t.Second);
	var fileName : String = userId + "_" + SharedSettings.conditions[level] + "_" 
	                        + bioharness.bhName + "_" + date + ".txt";
	SharedSettings.ioWriter = new StreamWriter(Application.persistentDataPath + "/" + fileName);
    SharedSettings.writeLog("Start game", SharedSettings.conditions[level]);
	//var FRead = new File.OpenText(filePath + fileName + ".txt");
}

