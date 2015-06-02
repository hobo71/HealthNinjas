#pragma strict
var alpha : float;
//resp property
private var targetRR : float = SharedSettings.targetRR;
private var transitRR : float = SharedSettings.transitRR;

//environment
var minWallPos : float = -10.55;
var maxWallPos : float = -3.13;
private var curWallPos : float = minWallPos;
private var preWallPos : float = minWallPos;
private var k : float = (maxWallPos - minWallPos) / (transitRR - targetRR);

//bioharness
function updateHeight(rr:float){
	var pos : float;
	if (rr >= transitRR){ //wall max . guidance on
		pos = maxWallPos;
	}
	else if (rr < transitRR && rr >= targetRR){ //smoothly change wall height
		pos = minWallPos + k * (rr - targetRR);
	} 
	else { //good
		pos = minWallPos;
	}
	curWallPos = preWallPos * alpha + pos * (1 - alpha);
	preWallPos = curWallPos;
}

function resetFence(){
	curWallPos = minWallPos;
}

function OnGUI() {
	gameObject.transform.position.y = curWallPos;
}