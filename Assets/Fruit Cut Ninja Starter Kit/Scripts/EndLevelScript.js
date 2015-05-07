//after time out - this scripts block game and show finish screen

#pragma strict
var done : boolean = false;
var completed : boolean = false;
var finishedGUI : GameObject;

function Awake () {
}

function LateUpdate () {
		
	if (done && !completed) {
		GameObject.Find("FruitDispenser").GetComponent(FruitDispenser).pause = true;
		completed = true;
		GameObject.Find("MainScripts").GetComponent(Timer).EndTimer();
		//GameObject.Find("GUI").SetActiveRecursively(false);
		GameObject.Find("GUI").SetActive(false);
		GameObject.Find("BioHarness").SetActive(false);
		//finishedGUI.SetActiveRecursively(true);
		finishedGUI.SetActive(true);
		GetComponent(MouseControl).enabled = false;		
	}
}

