//fruit dispenser - dispense fruits with differend speed and time and gravitation

#pragma strict
var mouseControl : MouseControl;
var timer : Timer;
var fruits : GameObject[];
var junks : GameObject[];
var bonus : GameObject[];
private var fruitsCombo : String[] = ["yellow-bonus","red-bonus","green-bonus"];

var bonusOn : boolean = false;
var z : float;
var sfx : AudioClip;
var pause : boolean = false;

private var started : boolean = false;
private var powerMod : float;
//default property
private var targetRR : float = SharedSettings.targetRR;
private var transitRR : float = SharedSettings.transitRR;
private var sfInterval : float = 25.0f; //super fruit interval
//Junk/Health proportion
var maxJunkProb : float = 100.0f;
var minJunkProb : float = 40.0f;
var kJunkProb : float = (maxJunkProb - minJunkProb) / (transitRR - targetRR);
var junkProb : float = minJunkProb;
//dispense frequency
private var minDisInterval : float = 0.40f;
private var maxDisInterval : float = 1.25f;
private var kDis : float = (maxDisInterval - minDisInterval) / (transitRR - targetRR);
private var disInterval : float = maxDisInterval;
private var curTime : float = 3.0f;


function Awake() {
	Random.seed = 85599;
	Physics.gravity.y = -3;
	powerMod = 0.70;
}

function Update() {
	if (pause) return;
	curTime -= Time.deltaTime;

	if (curTime <= 0.0 && !started) {
		curTime = 0.0;
		started = true;
	}

	if (started) {
		if (curTime <= 0.0) {
			FireUp();
			curTime = disInterval;
		}
	}
}

//biofeedback update
function junkUpdate(rr : float){
	if (rr > transitRR){ //too high
		junkProb = maxJunkProb;
		//disInterval = minDisInterval;
	}
	else if (rr <= transitRR && rr >= targetRR){ //in range
		junkProb = minJunkProb + (rr - targetRR) * kJunkProb;
		//disInterval = maxDisInterval - (rr - targetRR) * kDis;
	}
	else { //good
		junkProb = minJunkProb;
		//disInterval = maxDisInterval;
	}
}

function FireUp () {
	if (pause) return;
	else{
		// Spawn(1) => fruit 
		// Spawn(2) => junk food
		// Spawn(3) => super fruit 
		// Spawn(4) => bonus fruits
		if (bonusOn){
			//bunch of bonus fruits
			for (var j = 0;  j < 8; j++)
				Spawn(4); //bonus fruits
			bonusOn = false;
		}
		else{
			if (timer.curTime > 10 && timer.curTime % sfInterval < 1.0f && disInterval > 0.8f || mouseControl.combos/15 > 0){
				Spawn(3); //super fruit
				mouseControl.combos = 0;
			}
			//spawn 2 
			for (var i = 0; i < 2; i++){
				var p = Random.Range(0,100);
				if (p < junkProb){ //junk food
					Spawn(2);
				} else{
					Spawn(1); //fruit
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
	if (type == 1) { //fruit : 1
		ins = GameObject.Instantiate(fruits[Random.Range(0,fruits.length)],transform.position + Vector3(x,0,z),Random.rotation);
	}
	else if (type == 2){ //junk: 2
		z = Random.Range(0,0.3);
		ins = GameObject.Instantiate(junks[Random.Range(0,junks.length)],transform.position + Vector3(x,0,z),Random.rotation);
		//ins.transform.localScale = bombSize;
	}
	else if (type == 4){ //bonus fruit: 4 - does not count combos on them
		var i = Random.Range(0,fruits.length);
		ins = GameObject.Instantiate(fruits[i],transform.position + Vector3(x,0,z),Random.rotation);
		ins.tag = fruitsCombo[i];
	}
	if (type == 3){ //super fruit
		var y = Random.Range(0,3);
		var xs = [-8,8];
		x = xs[Random.Range(0,2)];
		ins = GameObject.Instantiate(bonus[Random.Range(0,bonus.length)],transform.position + Vector3(x,y,z),Random.rotation);
		power = Random.Range(1.9,2.0) * -Physics.gravity.y * 2 * powerMod;
		direction = Vector3(-x * 0.2 * Random.Range(0.3,0.5),0.5,0);
		ins.rigidbody.AddTorque(Random.onUnitSphere * 0.8,ForceMode.Impulse);
		audio.PlayOneShot(sfx,1.0);
	}
	else{ //other common objects
		power = Random.Range(1.5,1.8) * -Physics.gravity.y * 1.5 * powerMod;
		direction = Vector3(-x * 0.05 * Random.Range(0.3,0.8),1,0);
		ins.rigidbody.AddTorque(Random.onUnitSphere * 0.1,ForceMode.Impulse);
	}
	//common settings
	direction.z = 0.0;
	ins.rigidbody.velocity =  direction * power;
}

function OnTriggerEnter (other : Collider) {
	//deduce point when fruit are not clicked
    Destroy(other.gameObject);
	if (other.gameObject.tag =="red" || other.gameObject.tag =="yellow" 
		|| other.gameObject.tag =="green") {
		mouseControl.combos = 0;
		mouseControl.targetScore -= 2;
		if (mouseControl.targetScore < 0){
			mouseControl.targetScore = 0;
		}
	}	
    else if (other.gameObject.tag == "bonus"){
    	Destroy(other.gameObject.transform.parent.gameObject);
    }
}