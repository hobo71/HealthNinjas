//fade out GUIText color

#pragma strict
var speed : float = 1.0;

function Update () {

if (this.gameObject.activeSelf)
	GetComponent(GUIText).material.color.a -= Time.deltaTime * speed;

}