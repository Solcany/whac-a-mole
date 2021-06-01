<script>
	import {onMount, onDestroy} from 'svelte';
	import {gameState} from './gameState.js';

	import {moleWidth, moleActivationChance} from './gameSettings.js';

	export let x, y
	let isActive = false

	let state;
	const unsubscribe = gameState.subscribe(value => {
    	state = value;
  	});
  	onDestroy(unsubscribe);

	$: if (state) {
    	handleStateChange()
	}

	function handleStateChange() {
		if(coinToss(moleActivationChance)) {
			isActive = true
		}
	}
	function handleClick() {
		isActive = !isActive
	}

	function coinToss(chance) {
		(Math.random() < chance) ? true : false;
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

