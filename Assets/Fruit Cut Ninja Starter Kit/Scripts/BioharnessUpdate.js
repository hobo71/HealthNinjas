#pragma strict
import System.IO;

var skin : GUISkin;
static var isConnected : boolean = false;
static var isConnecting : boolean = false;
static var bhName: String = "";
static var buttonStr: String = "Connect";
static var repirationRate: String = "N/A";
static var heartRate: String = "N/A";
//calibration
static var isCalibrated : boolean = false;
static var isCalibrating : boolean = false;
static var calibrationSeconds : int = 0;
private var brArray : Array = new Array();

private var curActivity: AndroidJavaObject;
var fruitDispenser: FruitDispenser;
var fenceUpdate: FenceUpdate;
var finishGui: FinishGUI;
var helper: GUITexture;
private var rrText: GUIText;
private var respBar: GUITexture;
private var targetLine: GUITexture;

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
	targetLine = GameObject.Find("GUI/RespBar/guideline").GetComponent(GUITexture);
	//initialize parameters
	alpha = abd[0];
	beta = abd[1];
	dt = abd[2];
}

function SetLog(str: String) {
	if (str == "Fail"){ //connect fail
		isConnecting = false;
		isConnected = false;
	}
	else{ //success
		switch(str) {
			case "BH BHT004383":
				bhName = "1";
				break;
			case "BH BHT004404":
				bhName = "2";
				break;
			case "BH BHT004495":
				bhName = "3";
				break;
			case "BH BHT004767":
				bhName = "4";
				break;
			default:
				bhName = "Wrong device";
				break;
				
		}
		isConnected = true;
		isConnecting = false;
		//SharedSettings.writeLog("Connected   ", bhName);
	}	
}

function SetRepirationRate(str: String) {
	repirationRate = str;
	if (str != "N/A") {
		rrInThisSecond = float.Parse(repirationRate);
		if (Application.loadedLevel != SharedSettings.Menu) {
			SharedSettings.writeLog("Resp rate ", repirationRate+"      ");
			if (Application.loadedLevel == SharedSettings.NEBF_Indirect) {
				fruitDispenser.junkUpdate(rrInThisSecond);
			}
		} else if (isCalibrating) {
			//SharedSettings.writeLog("Resp rate ", repirationRate+"      ");
			calibrationSeconds++;
			if (calibrationSeconds > 20) { //discard first 20 seconds data
				brArray.push(rrInThisSecond);
			}
		}
	}
}


function getTargetRate() {
	brArray.sort();
	var index : int = brArray.length * 0.25;
	Debug.Log("#" + index +": "+brArray[index]);
	return brArray[index];
}


function SetHeartRate(str: String) {
	heartRate = str;
	if (str != "N/A" && Application.loadedLevel != SharedSettings.Menu) {
		SharedSettings.writeLog("Heart rate", heartRate+"        ");
	}
}

function Connect() {
	curActivity.Call("connect");
	isConnecting = true;
}

// Use this for initialization
function Start () {
}
	
// Update fence height once per dt for game biofeedback
function Update () {
	if (isConnected && Application.loadedLevel != SharedSettings.Menu) {
		if (curTime > dt) {
			curTime = 0;
			rrAtThisDt = rr_1 - (rr_1 - rrInThisSecond) * alpha - (rr_2 - rr_1) / dt * beta;
			if (Application.loadedLevel == SharedSettings.NEBF_Direct || 
				Application.loadedLevel == SharedSettings.BF_Only){
				fenceUpdate.updateHeight(rrAtThisDt);
			}
			rr_2 = rr_1;
			rr_1 = rrAtThisDt;	
		} else {
			curTime += Time.deltaTime;
		}
	} 
}


function OnGUI() {
	GUI.skin = skin;
	if (isConnected && Application.loadedLevel != SharedSettings.Menu) {
		//rrText.text = rrAtThisDt + "";
		targetLine.pixelInset.x = (SharedSettings.targetRR / SharedSettings.maxRR) * 320;
		//update respiration bar
		if (repirationRate == "N/A");
		else{
			var rr = Mathf.Round(rrAtThisDt * 100) / 100;
			if (rr > SharedSettings.maxRR){ 
				rr = SharedSettings.maxRR;
			}
			respBar.pixelInset.width = (320 / SharedSettings.maxRR)* rr;

			//set color of texture
			if (rr < SharedSettings.targetRR){ 
				//green means good
				respBar.color = Color.green;
			}
			else if(rr < SharedSettings.transitRR){
				//green to red means in range
				respBar.color = Color.Lerp(Color.green, Color.red, (rr - SharedSettings.targetRR) / (SharedSettings.transitRR - SharedSettings.targetRR));
				//disable helper
				helper.color = Color.clear;
			}
			else{
				//red out of range
				respBar.color = Color.red;
				//set helper
				helper.color = Color(0.5, 0.5, 0.5, 1);
			}
		}
	}
}
