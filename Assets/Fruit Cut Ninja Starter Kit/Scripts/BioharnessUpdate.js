#pragma strict

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
private var alpha: float = 0.005f; 
private var beta: float = 0.09f; 
private var dt: float = 0.1f;
private var rrInThisSecond: float = 0.0f; //updated rr from bioharness
private var rrAtThisFrame: float = 0.0f; //rr at frame t
private var rr_1: float = 0.0f; //rr at frame t-1
private var rr_2: float = 0.0f; //rr at frame t-2
private var curTime: float = 0.0f;

function Awake() {
	var jc = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
	curActivity = jc.GetStatic.<AndroidJavaObject>("currentActivity");
	rrText = GameObject.Find("GUI/RespBar/text").GetComponent(GUIText);
	respBar = GameObject.Find("GUI/RespBar/bar").GetComponent(GUITexture);
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
		fruitDispenser.updateBonusProb(rrInThisSecond);
	}
}

// Use this for initialization
function Start () {
}
	
// Update fence height once per frame
function Update () {
	if (curTime > dt) {
		curTime = 0;
		rrAtThisFrame = rr_1 - (rr_1 - rrInThisSecond) * alpha - (rr_2 - rr_1) / dt * beta;
		fenceUpdate.updateHeight(rrAtThisFrame);
		rr_2 = rr_1;
		rr_1 = rrAtThisFrame;	
	} else {
		curTime += Time.deltaTime;
	}
	
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
			respBar.pixelInset.height = 0;
			rrText.color = Color.white;
		}
	}
	
	rrText.text = rrAtThisFrame + "";
	//respiration bar
	if (repirationRate == "N/A");
	else{
		var rr = Mathf.Round(rrAtThisFrame * 100) / 100;
		if (rr > maxRR){ 
			rr = maxRR;
		}
		respBar.pixelInset.width = (220 / maxRR)* rr;

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
