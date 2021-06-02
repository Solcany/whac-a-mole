<script>
	import {onMount, onDestroy} from 'svelte';
	import {moleWidth, moleActivationChance} from './settings.js';
	import {gameTicker, gameScore} from './store.js';

	export let x, y, value

	let isActive = false
	$: $gameTicker, handleTicks();

	onMount(()=> {
		console.log(value)
	})



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
		background-color: green;
	}

	.active {
		border: solid 5px blue;
	}
</style>

<span on:click={handleClick} 
	  class:active={isActive}
	  style="--size:{moleWidth}px; --x:{x}px; --y:{y}px;">
</span>

