#pragma strict
private static var s1: ParticleSystem;
private static var s2: ParticleSystem;
private static var s3: ParticleSystem;
private static var fence: GameObject;

//resp property
private static var highRR : float = SharedSettings.highRR;
private static var targetRR : float = SharedSettings.targetRR;
private static var transitRR : float = SharedSettings.transitRR;

//environment
private static var maxEmissionRate : float = 125;
private static var minEmissionRate : float = 0;
private static var maxWallPos : float = 8;
private static var minWallPos : float = 2.5;
private static var snowEmissionRate : float = minEmissionRate;
private static var wallPos : float = minWallPos;
private static var k : float = (maxWallPos-minWallPos)/(transitRR-targetRR);
private static var b : float = maxWallPos - k*transitRR;

function Awake() {
	s1 = GameObject.Find("Snow/s1").GetComponent(ParticleSystem);
	s2 = GameObject.Find("Snow/s2").GetComponent(ParticleSystem);
	s3 = GameObject.Find("Snow/s3").GetComponent(ParticleSystem);
	fence = GameObject.Find("Fence");
}

function Start () {
}

function Update () {
}

function initEnv () {
	snowEmissionRate = minEmissionRate;
	wallPos = minWallPos;
}

//bioharness rr set bomb property
function setEnvironment(rr:float){
	if (rr >= highRR){ //too high
		snowEmissionRate = maxEmissionRate;
		wallPos = maxWallPos;
	}
	else if (rr >= transitRR && rr < highRR){ //change mist alpha
		var kk = (rr-transitRR)/(highRR-transitRR);
		snowEmissionRate = maxEmissionRate * kk;
		wallPos = maxWallPos;
	}
	else if (rr < transitRR && rr >= targetRR){ //change wall height
		wallPos = k*rr + b;
		snowEmissionRate = minEmissionRate;
	} 
	else { //good
		snowEmissionRate = minEmissionRate;
		wallPos = minWallPos;
	}
}

function OnGUI() {
	fence.transform.position.y = wallPos;
	s1.emissionRate = s2.emissionRate = s3.emissionRate = snowEmissionRate;
}