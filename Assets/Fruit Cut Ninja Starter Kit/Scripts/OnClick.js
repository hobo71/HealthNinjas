#pragma strict
var selected : boolean = false;
var thisHolder : GUITexture;
var thatHolder : GUITexture;
var thatChoice : OnClick;
var originalTexture : Texture;
var selectedTexture : Texture;
var main : Main;

function Update() {
	if (!selected) {
		if (guiTexture.HitTest(Input.mousePosition) && Input.GetMouseButton(0)) {
			//select this choice
			selected = true;
			thisHolder.texture = selectedTexture;
			//unselect the other choice
			thatChoice.selected = false;
			thatHolder.texture = originalTexture;
			//enable ok button
			main.buttonEnabled = true;
		}
	}
}