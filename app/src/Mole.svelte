<script>
	import {onMount, onDestroy} from 'svelte';

	import {moleActiveImgPath,
			moleInactiveImgPath,
			moleActivationChance} from './settings.js';

	import {gameTicker, gameScore} from './store.js';

	export let x, y, width, value

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
		background-size: cover;
		background-image: var(--inactivePath);
	}

	span.active {
		background-image: var(--activePath);
	}

	span:active{
		focus: none;
	}

	span.active:hover {
		cursor: pointer;
	}

</style>

<span on:click={handleClick} 
	  class:active={isActive}
	  style="--size:{width}px; 
	  		 --x:{x}px; 
	  		 --y:{y}px;
	  		 --activePath: url({moleActiveImgPath});
	  		 --inactivePath: url({moleInactiveImgPath});">
</span>

