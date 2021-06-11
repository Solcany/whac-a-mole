<script>
	import {onMount, onDestroy} from 'svelte';
	import {get} from 'svelte/store';

	import {imgPath,
			gameTickTime,
			moleInactiveImgPath} from './settings.js';

	import {gameTime, 
			gameScore, 
			currentAudioTrack} from './store.js';

	export let x, y, diameter, value, activeImgSrc, activationChance, audioSrc

	let isActive = false

	$: $gameTime, handleTime();

	function handleTime() {
		let isTick = ($gameTime % gameTickTime == 0) ? true : false;
		if(isTick) {
			isActive = false;
			if(coinToss(activationChance)) {
				isActive = true;
			}
		}
	}

	function setAudioTrack() {
		let l = Math.random();
		currentAudioTrack.set({v:  l, src: audioSrc});
	}

	function handleClick() {
		if(isActive) {
			isActive = false;
			updateScore();
			setAudioTrack();
		}
	}
	function updateScore() {
		let v = parseInt(value);
		$gameScore = [...$gameScore, v];	
	}
	function coinToss(chance) {
		return (Math.random() < activationChance ? true : false);
	}
</script>

<style>
	span {
		position: absolute;
		transform: translate(-50%, -50%);
		width:	var(--size);
		height: var(--size);
		left: var(--x);
		top: var(--y);
		border-radius: 100%;
		z-index: 1;
		background-size: cover;
	}
	span.inactive {
		background-image: var(--inactivePath);
	}
	span.active {
		background-image: var(--activePath);
	}
	span.active:focus{
		focus: none;
	}	
	span.active:hover {
		cursor: pointer;
	}
</style>

<span on:click={handleClick}
	  class:inactive={!isActive}
	  class:active={isActive}
	  style="--size:{diameter}px; 
	  		 --x:{x}px; 
	  		 --y:{y}px;
	  		 --activePath: url({activeImgSrc});
	  		 --inactivePath: url({moleInactiveImgPath});">
</span>

