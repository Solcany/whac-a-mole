<script>
	import {fontName} from "./settings.js";	
	export let clickAction, text, imgSrc, audioSrc;
	import {currentAudioTrack} from './store.js';

	import {gameTimeUnit,
		    audioButtonFadeTick,
			audioResetThresh} from './settings.js';		
	import {onMount} from "svelte"

	let player;

	function handleClick() {
		player.play();

	    var delayClick = setInterval(function () {
	        if (player.volume > audioResetThresh) {
	            player.volume -= audioButtonFadeTick;
	        }
	        if (player.volume < audioResetThresh) {
				player.pause();
	            clearInterval(delayClick);
	            clickAction();
	        }
	    }, gameTimeUnit);
	}
		
</script>

<style>
	button {
		background: none;
		outline: none;
		border: none;
	}
	button:hover {
		cursor: pointer;
	}
	button img {
		width: 200px;
		height: 200px;
		display: block;		
	}
	button span {
		display: block;
		color: white;
		text-align: center;
		font-size: 30px;
		font-family: var(--fontName), serif;    	
        font-style: bold;
        font-weight: 700;
    }
</style>

<button on:click={handleClick}>
	<img src="{imgSrc}">
	<span style="--fontName: {fontName};"> {text}</span>
	<audio bind:this={player} src={audioSrc}/>
</button>