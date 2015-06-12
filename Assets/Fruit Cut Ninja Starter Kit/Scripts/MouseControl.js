//control by mouse - can be easly translate to control by touch etc

#pragma strict

var raycastCount : int = 10;
	
var started : boolean = false;
var start : Vector3;
var end : Vector3;

var mouseMode : int = 0;

var cur : Texture2D;
private var cSize : float;
var screenInp : Vector2;

var fire : boolean = false;
var fire_prev : boolean = false;
var fire_down : boolean = false;
var fire_up : boolean = false;

var trail : LineRenderer;

var trial_alpha : float = 0.0;

var splatSfx : AudioClip[];
var explodeSfx : AudioClip[];
var encourageSfx: AudioClip[];
var splashPrefab : GameObject[];
var splashFlatPrefab : GameObject[];
var swingSfx : AudioClip;

var linePart : int = 0;
var lineTimer : float = 0;

var trailPositions : Vector3[] = new Vector3[10];
var blockSfx : boolean = false;
var fenceBlocked : boolean = false;
var points : int = 0;
var combos: int = 0;
var fruitDispenser: FruitDispenser;
var finishGui: FinishGUI;
var flashGui: GUITexture;
var flashSpeed : float = 1.5f;
var isFlash : boolean = false;
var isFlashIn : boolean = false;
var isFlashOut : boolean = false;

var scoreEffect : GameObject;
var targetScore : int = 0;
private var deltaPoint : int = 0;
private var currentType: String;
var guiPoints : GUIText;

function Awake () {
	cSize = Screen.width * 0.01;
	// Set the texture so that it is the the size of the screen and covers it.
    flashGui.enabled = false;
    flashGui.pixelInset = new Rect(0f, 0f, Screen.width, Screen.height);
    combos = 0;
    points = 0;	
}

function Flash()
{	
	if (isFlashIn){
	    flashGui.color = Color.Lerp(flashGui.color, Color.black, 0.04/* 0-1: the smaller the longer it takes*/); 
	    // If the screen is almost black...
	    if(flashGui.color.a >= 0.98f){
	        isFlashIn = false;
	        isFlashOut = true;
	        flashGui.color = Color.black;
	    }
    }
    else if (isFlashOut){
	    flashGui.color = Color.Lerp(flashGui.color, Color.clear, 0.03);
	    if(flashGui.color.a <= 0.02f)
	    {
	        // ... set the colour to clear and disable the GUITexture.
	        isFlashOut = false;
	        isFlash = false;
	        flashGui.enabled = false;
	        flashGui.color = Color.clear;
	    }	
    }
    else{ //initialize
    	isFlashIn = true;
    }
    
}

//explode object
function BlowObject(hit : RaycastHit) {
	if (hit.collider.gameObject.tag != "destroyed") {	
		//Debug.Log(hit.transform.gameObject.layer);		
		var splashZ = hit.point;
		var go : GameObject;
		if (hit.collider.gameObject.GetComponent(CreateOnDestroy)!=null){
			go = hit.collider.gameObject;
		}
		else{ //for those game objects with collider parts on children
			go = hit.collider.gameObject.transform.parent.gameObject;
		}
		go.GetComponent(CreateOnDestroy).Kill();
		//score effect
		var so = GameObject.Instantiate(scoreEffect, go.transform.position, Quaternion.identity);				
		var PointScript = so.GetComponent(ScoreEffect);
		//if not bomb inc points
		if (hit.collider.gameObject.tag !="bomb") {
			if (hit.collider.gameObject.tag=="bonus"){ // bonus
					targetScore += SharedSettings.bonus;
					PointScript.Point = SharedSettings.bonus;
					PointScript.type = "bonus";
					combos = 0;
					fruitDispenser.bonusOn = true;
					currentType = "bonus";
			}
			else{
				var index = 0;
				if (hit.collider.tag=="red" || hit.collider.tag=="red-bonus") index = 0;
				if (hit.collider.tag=="yellow" || hit.collider.tag=="yellow-bonus") index = 1;
				if (hit.collider.tag=="green" || hit.collider.tag=="green-bonus") index = 2;	
				splashZ.z = 4; //front
				var ins = GameObject.Instantiate(splashPrefab[index],splashZ,Quaternion.identity);				
				//splashZ.z = 9;	//back
				//var ins2 = GameObject.Instantiate(splashFlatPrefab[index],splashZ,Quaternion.identity);		
				audio.PlayOneShot(splatSfx[Random.Range(0,splatSfx.length)],1.0);
				targetScore += SharedSettings.fruit; 
				PointScript.Point = SharedSettings.fruit;
				PointScript.type = "fruit";
				currentType = "fruit";
				if (hit.collider.tag=="red-bonus" || hit.collider.tag=="yellow-bonus" || hit.collider.tag=="green-bonus");
				else combos ++;
				if (combos%6 == 0) audio.PlayOneShot(encourageSfx[Random.Range(0,encourageSfx.length)],1.0);
			}
			//decrease bomb frequency and size
			//fruitDispenser.downBombPro();
		}
		//if bomb
		else {
			if (isFlash){
				//if another flash triggered when the current flash has not done yet..
				//cancel the current flash-in or flash-out
				isFlashIn = false;
				isFlashOut = false;
			}
			isFlash = true;
			flashGui.enabled = true;
			audio.PlayOneShot(explodeSfx[Random.Range(0,explodeSfx.length)],1.0);
			targetScore -= SharedSettings.junk;
			PointScript.Point = SharedSettings.junk;
			PointScript.type = "junk";
			currentType = "junk";
			PointScript.operation = "-";
			combos = 0;
			//increase bomb frequency and size
			//fruitDispenser.upBombPro();
		}
		if (targetScore<0) targetScore = 0;
		finishGui.score = targetScore;
		Destroy(go);
	}
	hit.collider.gameObject.tag = "destroyed";
	
}

//send vertex position of trail into trail object
function SendTrailPosition() {
	var index = 0;
	for (var v : Vector3 in trailPositions) {
			trail.SetPosition(index,v);
			index++;
	}
}

//add vertex position of trail (array)
function AddTrailPosition() {
	if (linePart>9) {
		for (var i=0;i<=8;i++) trailPositions[i] = trailPositions[i+1];
			trailPositions[9] = Camera.main.ScreenToWorldPoint(Vector3(start.x, start.y, 10));
		} 
	else{
		for (var ii=linePart;ii<=9;ii++)
			trailPositions[ii] = Camera.main.ScreenToWorldPoint(Vector3(start.x, start.y, 10));		
	}
}

//play sound of swing
function PlaySfx() {
	if (blockSfx) 
		return;
	blockSfx = true;
	audio.PlayOneShot(swingSfx,1.0);
	yield WaitForSeconds(swingSfx.length);
	blockSfx = false;
}

//control script
function Control() {
	//first time DOWN button
	if (fire_down){
		//Debug.Log("down");
		trial_alpha = 1.0;
		linePart = 0;
		start = screenInp;
		end = screenInp;
			
		AddTrailPosition();
		started = true;
		lineTimer = 0.25;
	}
		
	//continous hold
	if (fire && started){
		//Debug.Log("hold");	
		start = screenInp;
		//distance on world space
		var a = Camera.main.ScreenToWorldPoint(Vector3(start.x, start.y, 10));
		var b = Camera.main.ScreenToWorldPoint(Vector3(end.x, end.y, 10));
		if (Vector3.Distance(a,b)>0.4) 
			PlaySfx();	
		if (Vector3.Distance(a,b)>0.1) {			
			lineTimer = 0.25;
			AddTrailPosition();
			linePart++;
		}
		end = screenInp;
		trial_alpha = 0.75;
	}
		
	//if trial alpha is more than 0.5 - perform raycast of cut
	if (trial_alpha>0.5) {
		//Debug.Log("raycast");
		for (var p = 0; p<8 ; p++) {
			for (var i = 0; i < raycastCount; i++){
				var ray : Ray = Camera.main.ScreenPointToRay(Vector3.Lerp(Camera.main.WorldToScreenPoint(trailPositions[p]),Camera.main.WorldToScreenPoint(trailPositions[p+1]), i * 1.0 / raycastCount * 1.0));
				Debug.DrawLine(ray.origin,ray.direction * 10,Color.green,1.0);
				var hit : RaycastHit;
				/* 1<<10 layermask
				 * 10 = 00001010
				 *
				 */
				if (Physics.Raycast(ray, hit,100,(1<<10))){
					BlowObject(hit);
				}
			}
		}	
	} 
		
	if (trial_alpha==0) 
		linePart=0;
	
	lineTimer -= Time.deltaTime;
	
	if (lineTimer<=0.0) {
		AddTrailPosition();
		linePart++;
		lineTimer = 0.01;
	}
		
	if (fire_up && started) 
		started = false;
		
	//copy array to trail
	SendTrailPosition();
}

function Update () {
	var Mouse : Vector2;

	if (Time.timeScale<1.0) return;
	//here you can add touch control
	Mouse.x = Mathf.Clamp((Input.mousePosition.x - (Screen.width/2)) / Screen.width*2,-1,1);
	Mouse.y = Mathf.Clamp(-(Input.mousePosition.y - (Screen.height/2)) / Screen.height*2,-1,1);		
		
	screenInp = Mouse;
		
	screenInp.x = (screenInp.x + 1) * 0.5;
	screenInp.y = (-screenInp.y + 1) * 0.5;

	screenInp.x *= Screen.width;
	screenInp.y *= Screen.height;
		
	fire_down = false;
	fire_up = false;
		
	fire = Input.GetMouseButton(0);
		
	if (fire && !fire_prev) 
		fire_down = true;
	if (!fire && fire_prev) 
		fire_up = true;
	
	fire_prev = fire;
	
	if (isFlash){
		Flash();
	}
	//if the screen can be seen
	if (!isFlash || isFlashOut && flashGui.color.a<=0.4f)
		Control();
				
	var c1 = Color(1,1,0,trial_alpha);
	var c2 = Color(1,0,0,trial_alpha);
	trail.SetColors(c1,c2);		
	if (trial_alpha>0) 
		trial_alpha -= Time.deltaTime;
	 	
	deltaPoint += Time.deltaTime*65; //continuously increasing speed. larger the faster
	if (points < targetScore) {
		if (currentType == "fruit"){
			guiPoints.color = new Color (0,204.0f/255,0,1.0f);
		}
		else if (currentType == "bonus"){
			guiPoints.color = new Color (1.0f,215.0f/255,0);	
		}
		if (deltaPoint > 1){
			points += 1;
			deltaPoint = 0;
		}
	}
	else if (points > targetScore){
		guiPoints.color = new Color (1.0f,0,0);
		if (deltaPoint > 1){
			points -= 1;
			deltaPoint = 0;
		}
	}
	else {
		guiPoints.color = new Color (1,1,0);
	}
	guiPoints.text = points.ToString();
	
	//Debug.Log(Time.deltaTime);	
}


function OnGUI() {
	//Draw Cursor
	GUI.depth = -100;
	if (!fire) 
		GUI.DrawTexture(Rect(screenInp.x-cSize*0.5,
					   (Screen.height-screenInp.y)-cSize*0.5,cSize,cSize),
					   cur);
	else 
		GUI.DrawTexture(Rect(screenInp.x-cSize*2*0.5,
					   (Screen.height-screenInp.y)-cSize*2*0.5,cSize*2,cSize*2),
					   cur);
}