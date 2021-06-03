<script>
	import {onMount, onDestroy} from 'svelte';
	import {imgPath,
			gameTickTime,
			moleInactiveImgPath} from './settings.js';
	import {gameTime, gameScore} from './store.js';

	export let x, y, diameter, value, activeImgSrc, activationChance
	let isActive = false
	$: $gameTime, handleTime();

	function handleTime() {
		let isTick = ($gameTime % gameTickTime == 0) ? true : false;
		if(isTick) {
			// reset mole on tick
			isActive = false;
			// activate mole on chance
			if(coinToss(activationChance)) {
				isActive = true;
			}
		}
	}
	function handleClick() {
		if(isActive) {
			isActive = false;
			updateScore();
		}
	}

	function updateScore() {
		let v = parseInt(value);
		gameScore.update(score => score + v);
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
		/*background-color: var(--color);*/
		border-radius: 100%;
		z-index: 1;
		background-size: cover;
	}

	span.inactive {
		/*background-color: var(--color);*/
		background-image: var(--inactivePath);
	}

	span.active {
		/*background-color: white;*/
		background-image: var(--activePath);
	}

/*	span.active:after {
	  content: "";
	  border-radius: 100%;
  	  position: absolute;
  	  top: 14%;
  	  left: 14%;
  	  width: 72%;
  	  height: 72%;
	  background: rgba(100,0,0,0.35);
	}*/

	span:active{
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
	  		 --activePath: url({imgPath}mole_active_{activeImgSrc});
	  		 --inactivePath: url({moleInactiveImgPath});">
</span>

