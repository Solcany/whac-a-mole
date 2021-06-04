<script>
import { gameState } from './store.js'

import Button from './Button.svelte'	
import H1 from './H1.svelte'	
import Footer from './Footer.svelte'	


function startGame() {
	gameState.set("game")
}

</script>

<style>
	div.main {
	 	width: 100%;
	 	height: 100vh;
	 	display: flex;
	 	flex-direction: column;
	 	align-items: center;
	 	justify-content: space-between;
	}
	nav {
		margin-bottom: 50px;
	}
</style>

<div class="main">
	<H1 text="Whac' A Mole"/>
	<nav>
		<Button handleClick={startGame} text="Start" imgSrc="../assets/image/mole_active_4.png"/>
	</nav>
	<Footer/>
</div>