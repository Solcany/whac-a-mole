<script>
import { gameState } from './store.js'
import { title, moleTypes } from './settings.js';

import { fade } from 'svelte/transition';
import { transitionTime, imgAbsPath, audioAbsPath } from './settings.js'


import AudioButton from './AudioButton.svelte'	
import H1 from './H1.svelte'	
import Footer from './Footer.svelte'

let buttonImgSrc = imgAbsPath + "mole_active_4.png";
let buttonSoundSrc = audioAbsPath + "01.mp3";



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

<div transition:fade="{{duration: transitionTime}}" class="main">
	<H1 text={title}/>
	<nav>
		<AudioButton clickAction={startGame} text="Start" imgSrc="{buttonImgSrc}" audioSrc="{buttonSoundSrc}"/>
	</nav>
	<Footer/>
</div>