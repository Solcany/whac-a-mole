<script>
import {gameState, gameScore} from "./store.js"
import {h1Size, h2Size} from "./settings.js";
import Button from "./Button.svelte"

function playAgain() {
	gameState.set("game");
	gameScore.set(0);
}

function returnToStart() {
	gameState.set("gameStart");
	gameScore.set(0);
}

</script>

<style>
 h1 {
 	font-size: var(--fontSize);
	font-family: 'gt_super'; 	
	color: white;
	width: 100%;
	text-align: center;
	display: block;		
 }

 h2 {
 	font-size: var(--fontSize);
	font-family: 'gt_super'; 
	color: white;
	width: 100%;
	text-align: center;
	display: block;	
 }
</style>

<div>
	<h1 style="--fontSize: {h2Size}"> Whac' A Mole </h1>
	<h2 style="--fontSize: {h1Size}"> Your score is {$gameScore} </h2>
</div>
<nav>
<Button handleClick={playAgain} text="play again"/>
<Button handleClick={returnToStart} text="return to menu"/>
</nav>