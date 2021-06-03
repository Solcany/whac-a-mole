<script>
import {gameState, gameScore} from "./store.js"
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
 	font-size: 100px;
 }
</style>


<h1> game over, your score is {$gameScore} </h1>
<nav>
<Button handleClick={playAgain} text="play again"/>
<Button handleClick={returnToStart} text="return to menu"/>
</nav>