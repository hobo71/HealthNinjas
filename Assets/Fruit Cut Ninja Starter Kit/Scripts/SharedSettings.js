//Global parameters - can be accesed even from different scene (menu etc)

#pragma strict

//time of game
static var ConfigTime : int = 300;

//level names
static var LevelName : String[] = ["Easy", "Medium", "Hard", "Extreme" ];

//1- easy, 2 - med, 3 - hard, 4 - extreme
static var LoadLevel : int = 3;

//respiration value
static var transitRR : float = 18.0f;
static var targetRR : float = 12.0f;

//score
static var bonus : int = 30;
static var fruit : int = 5;
static var junk : int = 10;
