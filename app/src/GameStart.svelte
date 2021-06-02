<script>
import Button from './Button.svelte'	
import { gameState } from './store.js'

function startGame() {
	gameState.set("game")
}

</script>

<style>
	nav {
		position: absolute;
		width: 200px;
		height: 50px;
		background-color: green;
		top: 50%;
		left: 50%;
		transform:translate(-50%, -50%);
	}

	button {
		width: 100%;
		height: 50px;
	}
</style>

{#if $gameState == "gameStart"}
	<nav>
		<Button handleClick={startGame} text="start game"/>
	</nav>
{/if}
