#pragma strict

static var isConnected = 0;
static var strLog: String = "disconnected";
static var buttonStr: String = "connect";
private var repirationRate: String = "N/A";

private var curActivity: AndroidJavaObject;
var fruitDispenser: FruitDispenser;
var envUpdate: FenceUpdate;
var finishGui: FinishGUI;
private var rrText: GUIText;

function Awake() {
	var jc = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
	curActivity = jc.GetStatic.<AndroidJavaObject>("currentActivity");
}

function SetLog(str: String) {
	if (str == "Fail"){ //connect fail
		strLog = "try again";
		isConnected = 0;
	}
	else{ //success
		strLog = str;
		isConnected = 1;
		buttonStr = "disconnect";
	}	
}

function SetRepirationRate(str: String) {
	repirationRate = str;
	var rr = float.Parse(repirationRate);
	envUpdate.updateHeight(rr);
	fruitDispenser.updateBonusProb(rr);
}

// Use this for initialization
function Start () {
}
	
// Update is called once per frame
function Update () {
}

function OnGUI() {
	if (GUI.Button(HelpClass.ScrRectCenter2(0.510,0.965,0.14,0.065),buttonStr)){
		if (!isConnected){ //connect
			buttonStr = "connecting..";
			curActivity.Call("connect");
		}
		else{ //disconnect
			curActivity.Call("disconnect");
			//fruitDispenser.initBombPro();
			isConnected = 0;
			buttonStr = "connect";
			repirationRate = "N/A";
			rrText.color = Color.white;
		}
	}
}
