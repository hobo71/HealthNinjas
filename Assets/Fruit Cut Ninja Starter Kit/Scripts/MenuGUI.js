#pragma strict
var skin : GUISkin;
var loadingText : GUIText;
var SharedSettings : SharedSettings;
var hSliderValue : float = 0.0;
var async : AsyncOperation;
var loading : boolean = false;

function OnGUI() {
	GUI.skin = skin;
	
	if (!loading){
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.3,0.3,0.075),"NEBF Direct")) {
			SharedSettings.loadedLevel = SharedSettings.NEBF_Direct;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
		
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.4,0.3,0.075),"NEBF Indirect")) {
			SharedSettings.loadedLevel = SharedSettings.NEBF_Indirect;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
		
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.5,0.3,0.075),"NE Control")) {
			SharedSettings.loadedLevel = SharedSettings.NE_Control;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
		
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.6,0.3,0.075),"BF Only")) {
			SharedSettings.loadedLevel = SharedSettings.BF_Only;
			//Application.LoadLevel(SharedSettings.loadedLevel);
			ClickAsync(SharedSettings.loadedLevel);
		}
	} else {
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
    while (!async.isDone) {
    	hSliderValue = async.progress;
    	yield;
    }
}