
private var GetHitEffect : float;
private var targY : float;
private var PointPosition : Vector3;

var PointSkin : GUISkin;
var PointSkinShadow : GUISkin;

var operation : String = "+";
var Point : float;
var type : String; 

function Start() {
	PointPosition = transform.position+Vector3(Random.Range(-0.2,0.2),Random.Range(-0.1,0.1),Random.Range(-0.2,0.2));
	targY = Screen.height * 0.1;
}

function OnGUI() {
	var screenPos2 : Vector3 = Camera.main.camera.WorldToScreenPoint(PointPosition);
	GetHitEffect += Time.deltaTime*30;
	GUI.skin.label.fontSize = 60;
	if (type == "fruit"){ //fruit
		GUI.color = new Color (0,204.0f/255,0,1.0f - (GetHitEffect - 50) / 10);
	}
	else if (type == "junk"){ //junk
		GUI.color = new Color (1.0f,0,0,1.0f - (GetHitEffect - 50) / 10);
		GUI.skin.label.fontSize = 100;
	}
	else{ //superfruit
		GUI.color = new Color (1.0f,215.0f/255,0,1.0f - (GetHitEffect - 50) / 10);
		GUI.skin.label.fontSize = 100;
	}
	
	GUI.skin = PointSkinShadow;
	GUI.Label (Rect (screenPos2.x+8 , targY-2, 300, 300), operation + Point.ToString());
	GUI.skin = PointSkin;
	GUI.Label (Rect (screenPos2.x+10 , targY, 300, 300), operation + Point.ToString());
	if (GetHitEffect > 100){
		Destroy(gameObject);
	}
}

function Update() {
	targY -= Time.deltaTime*50; //rising speed of score effect
}