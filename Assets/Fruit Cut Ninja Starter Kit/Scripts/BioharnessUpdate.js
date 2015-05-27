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
var envUpdate: FenceUpdate;
var finishGui: FinishGUI;
private var rrText: GUIText;
private var respBar: GUITexture;

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
			respBar.pixelInset.height = 0;
			rrText.color = Color.white;
		}
	}
	
	rrText.text = repirationRate;
	//respiration bar
	if (repirationRate == "N/A");
	else{
		var rr = Mathf.Round(parseFloat(repirationRate)*100)/100;
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
