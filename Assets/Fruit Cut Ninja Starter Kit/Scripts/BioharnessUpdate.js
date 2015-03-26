#pragma strict

//private var hrText: GUIText ;
//private var posText: GUIText ;
//private var accText: GUIText ;
private var logText: GUIText ;
private var rrText: GUIText ;
private var respBar: GUITexture ;


static var isConnected = 0;
static var strLog: String = "disconnected";
static var buttonStr: String = "connect";

private var heartRate: String = "N/A";
private var repirationRate: String = "N/A";
private var posture: String = "N/A";
private var peakAcceleration: String = "N/A";

static var highRR : float = SharedSettings.highRR;
static var targetRR : float = SharedSettings.targetRR;
static var rrRange : float = highRR - targetRR;

private var curActivity: AndroidJavaObject;
var fruitDispenser: FruitDispenser;
var envUpdate: EnvironmentUpdate;
var finishGui: FinishGUI;

function Awake() {
	//hrText = GameObject.Find("GUI/Left/HR").GetComponent(GUIText);
	//posText = GameObject.Find("GUI/Left/Pos").GetComponent(GUIText);
	//accText = GameObject.Find("GUI/Left/Acc").GetComponent(GUIText);
	rrText = GameObject.Find("GUI/Left/RR").GetComponent(GUIText);
	logText = GameObject.Find("GUI/Left/Log").GetComponent(GUIText);
	respBar = GameObject.Find("GUI/RespBar/RespirationBar").GetComponent(GUITexture);

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
	
function SetHeartRate(str: String) {
	heartRate = str;
}

function SetRepirationRate(str: String) {
	repirationRate = str;
	var rr = float.Parse(repirationRate);
	//fruitDispenser.setBombPro(rr);
	envUpdate.setEnvironment(rr);
}
	
function SetPosture(str: String) {
	posture = str;
}
	
function SetPeakAcceleration(str: String) {
	peakAcceleration = str;
}
	
// Use this for initialization
function Start () {
}
	
// Update is called once per frame
function Update () {
}

function OnGUI() {
	if (GUI.Button(HelpClass.ScrRectCenter2(0.07,0.35,0.06,0.065),buttonStr)) 
		if (!isConnected){ //connect
			strLog = "connecting..";
			logText.text = strLog; //to show it instantly
			curActivity.Call("connect");
		}
		else{ //disconnect
			strLog = "disconnecting..";
			curActivity.Call("disconnect");
			fruitDispenser.initBombPro();
			envUpdate.initEnv();
			isConnected = 0;
			strLog = "disconnected";
			buttonStr = "connect";
			
			heartRate = "N/A"; 
			repirationRate = "N/A";
			posture = "N/A";
			peakAcceleration = "N/A";
			respBar.pixelInset.height = 0;
			rrText.color = Color.white;
		}

	//hrText.text = heartRate; 
	//posText.text = posture;
	//accText.text = peakAcceleration;
	rrText.text = repirationRate;
	logText.text = strLog;

	
	//respiration bar
	if (repirationRate == "N/A");
	else{
		var rr = Mathf.Round(parseFloat(repirationRate)*100)/100;
		if (rr>highRR) rr = highRR; //max rr
		var height = (240/highRR)* rr; //240 is the total height of the rr bar
		respBar.pixelInset.height = height;

		//set color of texture
		if (rr < targetRR){ 
			//green means good
			respBar.color = Color.green;
			rrText.color = Color.green;
		}
		else if(rr < highRR){
			//green to red means in range
			respBar.color = Color.Lerp(Color.green, Color.red, (rr-targetRR)/rrRange);
			rrText.color = Color.Lerp(Color.green, Color.red, (rr-targetRR)/rrRange);
		}
		else{
			//red out of range
			respBar.color = Color.red;
			rrText.color = Color.red;
		}
		/*
		if (rr < targetRR){
			//green to yellow
			respBar.color = Color.Lerp(Color.green, Color.yellow, (targetRR-rr)/targetRR);
			rrText.color = Color.Lerp(Color.green, Color.yellow, (targetRR-rr)/targetRR);
			//respBar.color.a = 0.75;
		}
		else if(rr < highRR){
			//green to red
			respBar.color = Color.Lerp(Color.green, Color.red, (rr-targetRR)/rrRange);
			rrText.color = Color.Lerp(Color.green, Color.red, (rr-targetRR)/rrRange);
			//respBar.color.a = 1 - Mathf.Abs((rr-6)/4);
		}
		else{
			//red
			respBar.color = Color.Red;
			rrText.color = Color.Red;
		}
		*/
	}
}
