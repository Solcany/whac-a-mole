<script>
import {gameState, gameScore} from "./store.js"
import Button from "./Button.svelte"

function playAgain() {
	gameState.set("game")
}

</script>

<style>
 h1 {
 	font-size: 100px;
 }
</style>


<h1> game over, your score is {$gameScore} </h1>
<Button handleClick={playAgain} text="play again"/>
