#pragma strict

static var isConnected = 0;
static var strLog: String = "disconnected";
static var buttonStr: String = "connect";
private var repirationRate: String = "N/A";

static var highRR : float = SharedSettings.highRR;
static var targetRR : float = SharedSettings.targetRR;
static var rrRange : float = highRR - targetRR;

private var curActivity: AndroidJavaObject;
var fruitDispenser: FruitDispenser;
var envUpdate: EnvironmentUpdate;
var finishGui: FinishGUI;
private var rrText: GUIText;

function Awake() {
	var jc = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
	curActivity = jc.GetStatic.<AndroidJavaObject>("currentActivity");
	rrText = GameObject.Find("GUI/RR").GetComponent(GUIText);
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
	envUpdate.setEnvironment(rr);
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
			//strLog = "connecting..";
			buttonStr = "connecting..";
			curActivity.Call("connect");
		}
		else{ //disconnect
			curActivity.Call("disconnect");
			fruitDispenser.initBombPro();
			envUpdate.initEnv();
			isConnected = 0;
			//strLog = "disconnected";
			buttonStr = "connect";
			repirationRate = "N/A";
			rrText.color = Color.white;
		}
	}
	
	rrText.text = repirationRate;
	//respiration bar
	if (repirationRate == "N/A");
	else{
		var rr = Mathf.Round(parseFloat(repirationRate)*100)/100;
		if (rr>highRR) rr = highRR; //max rr
		var height = (240/highRR)* rr; //240 is the total height of the rr bar

		//set color of texture
		if (rr < targetRR){ 
			//green means good
			rrText.color = Color.green;
		}
		else if(rr < highRR){
			//green to red means in range
			rrText.color = Color.Lerp(Color.green, Color.red, (rr-targetRR)/rrRange);
		}
		else{
			//red out of range
			rrText.color = Color.red;
		}
	}
}
