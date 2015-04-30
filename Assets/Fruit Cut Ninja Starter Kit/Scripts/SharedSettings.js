//Global parameters - can be accesed even from different scene (menu etc)

#pragma strict

//time of game
static var ConfigTime : int = 300;

//level names
static var LevelName : String[] = ["Easy", "Medium", "Hard", "Extreme" ];

//1- easy, 2 - med, 3 - hard, 4 - extreme
static var LoadLevel : int = 3;

//respiration value
static var highRR : float = 24.0f;
static var transitRR : float = 14.0f;
static var targetRR : float = 10.0f;
