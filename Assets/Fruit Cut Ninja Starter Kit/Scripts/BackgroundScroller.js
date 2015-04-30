#pragma strict
private var bg: GameObject;
public var speed: float;
private var pos: float;

function Start () {

}

function Update () {
	pos += speed;
	if (pos>1.0f)
		pos -= 1.0f;
	renderer.material.mainTextureOffset = new Vector2(pos,0);
}