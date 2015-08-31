#pragma strict
var skin : GUISkin;
static var buttonEnabled : boolean = false;
var choice1_img : GUITexture;
var choice2_img : GUITexture;
var choice1_name : GUIText;
var choice2_name : GUIText;
var holder1 : GUITexture;
var holder2 : GUITexture;
var originalTexture : Texture;
var onClick1 : OnClick;
var onClick2 : OnClick;
private var num : int = 0;
var healthyFood : String[] = SharedSettings.healthyFood;
var unhealthyFood : String[] = SharedSettings.unhealthyFood;
var score : int = 0;


function Start () {
	var healthyTexture : Texture = Resources.Load(healthyFood[0], Texture);
	var unhealthyTexture : Texture = Resources.Load(unhealthyFood[0], Texture);
	if (Random.Range(0,2) < 1) {
		choice1_img.texture = healthyTexture;
		choice1_name.text = healthyFood[0];
		choice2_img.texture = unhealthyTexture;
		choice2_name.text = unhealthyFood[0];
	} else {
		choice1_img.texture = unhealthyTexture;
		choice1_name.text = unhealthyFood[0];
		choice2_img.texture = healthyTexture;
		choice2_name.text = healthyFood[0];
	}
}

function Update () {

}

function OnGUI(){
	GUI.skin = skin;
	if (buttonEnabled) {
		if (GUI.Button(HelpClass.ScrRectCenter2(0.5,0.8,0.2,0.10),"Ok")) {
			//check correctness
			if (onClick1.selected == true && choice1_name.text == healthyFood[num] ||
			    onClick2.selected == true && choice2_name.text == healthyFood[num]){
				SharedSettings.writeLog(choice1_name.text + " vs. " + choice2_name.text, "Correct");
				score++;
			} else {
				SharedSettings.writeLog(choice1_name.text + " vs. " + choice2_name.text, "Wrong");
			}
			num++;	
			//if done, go to result scene
			if (num == 12) {
				SharedSettings.score = score;
				Application.LoadLevel(7);
			}
			//load next set of images
			var healthyTexture : Texture = Resources.Load(healthyFood[num], Texture);
			var unhealthyTexture : Texture = Resources.Load(unhealthyFood[num], Texture);
			if (Random.Range(0,2) < 1) {
				choice1_img.texture = healthyTexture;
				choice1_name.text = healthyFood[num];
				choice2_img.texture = unhealthyTexture;
				choice2_name.text = unhealthyFood[num];
			} else {
				choice1_img.texture = unhealthyTexture;
				choice1_name.text = unhealthyFood[num];
				choice2_img.texture = healthyTexture;
				choice2_name.text = healthyFood[num];
			}
			holder1.texture = originalTexture;
			holder2.texture = originalTexture;
			onClick1.selected = false;
			onClick2.selected = false;
			buttonEnabled = false;			

		}
	}
}