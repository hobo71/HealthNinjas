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
private static var originalEmissionRate : float = 125;
private static var finalEmissionRate : float = 0;
private static var originalWallPos : float = -0.3;
private static var finalWallPos : float = -5.6;
private static var snowEmissionRate : float = finalEmissionRate;
private static var wallPos : float = finalWallPos;
private static var k : float = (originalWallPos-finalWallPos)/(transitRR-targetRR);
private static var b : float = originalWallPos - k*transitRR;

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
	snowEmissionRate = finalEmissionRate;
	wallPos = finalWallPos;
}

//bioharness rr set bomb property
function setEnvironment(rr:float){
	if (rr >= highRR){ //too high
		snowEmissionRate = originalEmissionRate;
		wallPos = originalWallPos;
	}
	else if (rr >= transitRR && rr < highRR){ //change mist alpha
		var kk = (rr-transitRR)/(highRR-transitRR);
		snowEmissionRate = originalEmissionRate * kk;
		wallPos = originalWallPos;
	}
	else if (rr < transitRR && rr >= targetRR){ //change wall height
		wallPos = k*rr + b;
		snowEmissionRate = finalEmissionRate;
	} 
	else { //good
		snowEmissionRate = finalEmissionRate;
		wallPos = finalWallPos;
	}
}

function OnGUI() {
	fence.transform.position.y = wallPos;
	s1.emissionRate = s2.emissionRate = s3.emissionRate = snowEmissionRate;
}