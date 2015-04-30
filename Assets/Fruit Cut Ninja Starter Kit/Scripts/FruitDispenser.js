//fruit dispenser - dispense fruits with differend speed and time and gravitation

#pragma strict
var mouseControl : MouseControl;
var fruits : GameObject[];
var bombs : GameObject[];
var bonus : GameObject[];
private var fruitsCombo : String[] = ["yellow-bonus","red-bonus","green-bonus"];

var bonusOn : boolean = false;
var z : float;
var sfx : AudioClip;
var pause : boolean = false;
var timer : float = 3.0;
var bombUpdateTimer : float = 3.0;
private var started : boolean = false;
private var powerMod : float;
//static 
private static var bombProbability : float = 0;
private static var bombSize : Vector3 = Vector3(1.00f, 1.00f, 1.00f);

//resp property
private static var highRR : float = SharedSettings.highRR;
private static var targetRR : float = SharedSettings.targetRR;
private static var rrRange : float = highRR - targetRR;
private static var transitRR : float = SharedSettings.transitRR;

//bomb property
private static var initialBombProbability: float = 10.0f;
private static var maxBombProbability: float = 90.0f;
private static var bombProbabilityPenalty: float = (maxBombProbability-initialBombProbability)/rrRange;

private static var initialBombSize: float = 1.0f;
private static var maxBombSize: float = 2.0f;
private static var bombSizePenalty: float = (maxBombSize-initialBombSize)/rrRange;


function Awake() {
	Random.seed = 898979;
	Physics.gravity.y = -3;
	powerMod = 0.70;
	//bombProbability = initialBombProbability;
	//bombSize = Vector3(initialBombSize,initialBombSize,initialBombSize);
	bombProbability = 50.0f;
	bombSize = Vector3(initialBombSize,initialBombSize,initialBombSize);
	/*
	if (SharedSettings.LoadLevel==1) {
		Random.seed = 356355;
		Physics.gravity.y = -1;
		powerMod = 1.0;
	}
	if (SharedSettings.LoadLevel==2) {
		Random.seed = 12411245;
		Physics.gravity.y = -2;
		powerMod = 0.825;
		bombProbability = 10;
	}
	
	if (SharedSettings.LoadLevel==4) {
		Random.seed = 64223459;
		Physics.gravity.y = -4;
		powerMod = 0.625; 
		bombProbability = 30;
	}
	if (SharedSettings.LoadLevel==3) {
		Random.seed = 898979;
		Physics.gravity.y = -3;
		powerMod = 0.70;
		bombProbability = initialBombProbability;
	}
	*/
}

function initBombPro(){
	//bombProbability = initialBombProbability;
	bombProbability = 50.0f;
	bombSize = Vector3(initialBombSize,initialBombSize,initialBombSize);
}

//bioharness rr set bomb property
function setBombPro(rr:float){
	var dif = rr - targetRR;
	if (dif > rrRange){ //too high
		bombProbability = maxBombProbability;
		bombSize = Vector3(maxBombSize, maxBombSize, maxBombSize);
	}
	else if (dif > 0 && dif < rrRange){ //in range
		bombProbability = initialBombProbability + dif*bombProbabilityPenalty;
		var newSize = initialBombSize + bombSizePenalty*dif;
		bombSize = Vector3(newSize, newSize, newSize);
	}
	else { //good
		bombProbability = initialBombProbability;
		bombSize = Vector3(initialBombSize, initialBombSize, initialBombSize);
	}
}

//click junk food penalty
function upBombPro(){
	//Debug.Log("upBombPro called");
	bombProbability += 5;
	if (bombProbability > maxBombProbability) {
		bombProbability = maxBombProbability;
	}
	
	bombSize += Vector3(0.1f, 0.1f, 0.1f);
	if (bombSize.x > maxBombSize){
		bombSize = Vector3(maxBombSize, maxBombSize, maxBombSize);
	}
}

//click fruits bonus
function downBombPro(){
	//Debug.Log("downBombPro called");
	if (bombProbability > initialBombProbability) {
		bombProbability -= 1.5;
	}
	if (bombSize.x > 1){
		bombSize -= Vector3(0.02f, 0.02f, 0.02f);
	}
}

function Update() {
	if (pause) return;
	timer -= Time.deltaTime;
	//bombUpdateTimer -= Time.deltaTime;

	if (timer<=0.0 && !started) {
		timer = 0.0;
		started = true;
	}

	if (started) {
		if (timer<=0.0) {
			FireUp();
			timer = 1.25;
		}
		/*if (bombUpdateTimer<=0.0) {
			//Debug.Log("bombUpdate");
			//bombUpdateTimer = 3.0;
			var currentBombs = GameObject.FindGameObjectsWithTag("bomb"); 
			if (currentBombs == null);
			else{
				for (var b in currentBombs){
					b.transform.localScale = bombSize;
				}
			}
		}*/
	}
}

function FireUp () {
	if (pause) return;
	else{
		// Spawn(false) => fruit 
		// Spawn(true) => junk food
		if (bonusOn){
			//bunch of bonus fruits
			for (var j = 0;  j < 8; j++)
				Spawn(4);
			bonusOn = false;
		}
		else{
			if (mouseControl.combos/6>0){ //bonus
				Spawn(3);
				mouseControl.combos = 0;
			}
			for (var i = 0; i < 2; i++){
				var p = Random.Range(0,100);
				//Debug.Log(p);
				if (p < bombProbability){
					Spawn(1);
				}
				else{
					Spawn(2);
				}
			}
		}
	}
}


function Spawn(type : int) {
	
	var x : float = Random.Range(-4.0,4);
	var z : float = Random.Range(1,2);
	var ins : GameObject;
	var power : float;
	var direction : Vector3;
	
	//initialize specific settings
	if (type==1) { //fruit : 1
		ins = GameObject.Instantiate(fruits[Random.Range(0,fruits.length)],transform.position + Vector3(x,0,z),Random.rotation);
	}
	else if (type==2){ //bomb: 2
		z = Random.Range(0,0.3);
		ins = GameObject.Instantiate(bombs[Random.Range(0,bombs.length)],transform.position + Vector3(x,0,z),Random.rotation);
		//ins.transform.localScale = bombSize;
	}
	else if (type==4){ //bonus fruit: 4 - does not count combos on them
		var i = Random.Range(0,fruits.length);
		ins = GameObject.Instantiate(fruits[i],transform.position + Vector3(x,0,z),Random.rotation);
		ins.tag = fruitsCombo[i];
	}
	//apply specific settings
	if (type==3){ //super fruit
		var y = Random.Range(0,3);
		var xs = [-8,8];
		x = xs[Random.Range(0,2)];
		ins = GameObject.Instantiate(bonus[Random.Range(0,bonus.length)],transform.position + Vector3(x,y,z),Random.rotation);
		power = Random.Range(1.8,2.0) * -Physics.gravity.y * 2 * powerMod;
		direction = Vector3(-x * 0.2 * Random.Range(0.3,0.5),0.5,0);
		ins.rigidbody.AddTorque(Random.onUnitSphere * 2,ForceMode.Impulse);
	}
	else{ //other common objects
		power = Random.Range(1.5,1.8) * -Physics.gravity.y * 1.5 * powerMod;
		direction = Vector3(-x * 0.05 * Random.Range(0.3,0.8),1,0);
		ins.rigidbody.AddTorque(Random.onUnitSphere * 0.1,ForceMode.Impulse);
	}
	//common settings
	direction.z = 0.0;
	ins.rigidbody.velocity =  direction * power;
	audio.PlayOneShot(sfx,1.0);
	
}

function OnTriggerEnter (other : Collider) {
	//deduce point when fruit are not clicked
	if (other.gameObject.tag =="red" || other.gameObject.tag =="yellow" 
		|| other.gameObject.tag =="green") {
		var points = mouseControl.points;
		var combos = mouseControl.combos;
		combos = 0;
		points -= 2;
		mouseControl.points = points>=0 ? points: 0;
	}	
    Destroy(other.gameObject);
}