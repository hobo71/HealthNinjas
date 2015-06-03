#pragma strict
var skin : GUISkin;
static var isConnected = 0;
static var strLog: String = "disconnected";
static var buttonStr: String = "connect";
private var repirationRate: String = "N/A";

//resp property
private var targetRR : float = SharedSettings.targetRR;
private var transitRR : float = SharedSettings.transitRR;
private var maxRR : float = SharedSettings.maxRR;

private var curActivity: AndroidJavaObject;
var fruitDispenser: FruitDispenser;
var fenceUpdate: FenceUpdate;
var finishGui: FinishGUI;
private var rrText: GUIText;
private var respBar: GUITexture;

//PD control var
private var abd_option_1: float[] = [0.0065f, 0.09f, 0.1f];
private var abd_option_2: float[] = [0.035f, 0.001f, 0.05f];
private var abd : float[] = abd_option_2;
private var alpha : float;
private var beta : float;
private var dt : float;
private var rrInThisSecond: float = 0.0f; //updated rr from bioharness per second
private var rrAtThisDt: float = 0.0f; //rr at dt
private var rr_1: float = 0.0f; //rr at d(t-1)
private var rr_2: float = 0.0f; //rr at d(t-2)
private var curTime: float = 0.0f; //how much time past in this dt

function Awake() {
	var jc = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
	curActivity = jc.GetStatic.<AndroidJavaObject>("currentActivity");
	rrText = GameObject.Find("GUI/RespBar/text").GetComponent(GUIText);
	respBar = GameObject.Find("GUI/RespBar/bar").GetComponent(GUITexture);
	//initialize parameters
	alpha = abd[0];
	beta = abd[1];
	dt = abd[2];
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
	if (str != "N/A") {
		rrInThisSecond = float.Parse(repirationRate);
		if (Application.loadedLevel == SharedSettings.NEBF_Indirect) {
			fruitDispenser.junkUpdate(rrInThisSecond);
		}
	}
}

// Use this for initialization
function Start () {
}
	
// Update fence height once per dt
function Update () {
	if (Application.loadedLevel == SharedSettings.NEBF_Direct) {
		if (isConnected) {
			if (curTime > dt) {
				curTime = 0;
				rrAtThisDt = rr_1 - (rr_1 - rrInThisSecond) * alpha - (rr_2 - rr_1) / dt * beta;
				fenceUpdate.updateHeight(rrAtThisDt);
				rr_2 = rr_1;
				rr_1 = rrAtThisDt;	
			} else {
				curTime += Time.deltaTime;
			}
		}	
	}
}

function OnGUI() {
	GUI.skin = skin;
	if (GUI.Button(HelpClass.ScrRectCenter2(0.510,0.965,0.14,0.065),buttonStr)){
		if (!isConnected){ //connect
			buttonStr = "connecting..";
			curActivity.Call("connect");
		}
		else{ //disconnect
			curActivity.Call("disconnect");
			isConnected = 0;
			//reset GUI
			buttonStr = "connect";
			repirationRate = "N/A";
			respBar.pixelInset.width = 0;
			rrText.color = Color.white;
			rrText.text = "disconnected"; 
			//reset fence
			curTime = 0;
			fenceUpdate.updateHeight(fenceUpdate.minWallPos);
		}
	}
	if (isConnected) {
		rrText.text = rrAtThisDt + "";
		//respiration bar
		if (repirationRate == "N/A");
		else{
			var rr = Mathf.Round(rrAtThisDt * 100) / 100;
			if (rr > maxRR){ 
				rr = maxRR;
			}
			respBar.pixelInset.width = (320 / maxRR)* rr;

			//set color of texture
			if (rr < targetRR){ 
				//green means good
				respBar.color = Color.green;
				rrText.color = Color.green;
			}
			else if(rr < transitRR){
				//green to red means in range
				respBar.color = Color.Lerp(Color.green, Color.red, (rr - targetRR) / (transitRR - targetRR));
				rrText.color = Color.Lerp(Color.green, Color.red, (rr - targetRR) / (transitRR - targetRR));
			}
			else{
				//red out of range
				respBar.color = Color.red;
				rrText.color = Color.red;
			}
		}
	}
}
