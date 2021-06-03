<script>
	import {onMount, onDestroy} from 'svelte';

	import {moleActiveImgPath,
			moleInactiveImgPath,
			moleActivationChance} from './settings.js';

	import {gameTicker, gameScore} from './store.js';

	export let x, y, diameter, value, color

	let isActive = false
	$: $gameTicker, handleTicks();

	function handleTicks() {
		// reset mole on tick
		isActive = false

		// activate mole on chance
		if(coinToss(moleActivationChance)) {
			isActive = true
		}
	}
	function handleClick() {
		if(isActive) {
			console.log("active")
			isActive = false
			updateScore()
		}
	}
	function updateScore() {
		let v = parseInt(value)
		gameScore.update(score => score + v)
	}

	function coinToss(chance) {
		return (Math.random() < chance ? true : false);
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
		background-color: var(--color);
		border-radius: 100%;
		/*background-size: cover;*/
		/*background-image: var(--inactivePath);*/
	}

	span.inactive {
		background-color: var(--color);
		/*background-image: var(--activePath);*/
	}

	span.active {
		background-color: white;
		/*background-image: var(--activePath);*/
	}

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
	  		 --color: {color};
	  		 --activePath: url({moleActiveImgPath});
	  		 --inactivePath: url({moleInactiveImgPath});">
</span>

