<script>
import Button from './Button.svelte'	
import { h1Size } from './settings.js'
import { gameState } from './store.js'

function startGame() {
	gameState.set("game")
}

</script>

<style>
    h1 {
    	position: absolute;
    	z-index: 999;
    	width: 100%;
    	margin-top: 2vh;
    	text-align: center;
    	font-size: var(--fontSize);
        color: white;    	
    	font-family: 'gt_super';
    }

	nav {
		position: absolute;
		top: 52%;
		left: 50%;
		transform:translate(-50%, -52%);
	}

	p {
		position: absolute;
		bottom: 0;
		width: 100%;
		text-align: center;
		color: white;
		font-family: monospace;
	}

	p a {
		color: white;
		text-decoration: underline;
	}

</style>
<h1 style="--fontSize: {h1Size};"> Whac' A Mole </h1>
<nav>
	<Button handleClick={startGame} text="Start" imgSrc="../assets/image/mole_active_4.png"/>
</nav>
<p>Made by Matúš Solčány in 2021. <a href="https://github.com/Solcany/whac-a-mole"> Code </a> </p>
