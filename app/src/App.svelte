<script>
	import GameStart from './GameStart.svelte';    
	import Game from './Game.svelte'; 
	import GameEnd from './GameEnd.svelte';        
	import Mole from './Mole.svelte';
	import Circle from './Circle.svelte';

	import { width, height, gameState} from './store.js';
	import { fitCircles, fitRandomCircle, getRandomCircle, getAbsoluteBounds } from './levelGeneration.js';

	// const boundsRelative = {x1: 0.0, y1: 0.0, x2: 1.0,  y2: 1.0}
	// const bounds = getAbsoluteBounds(boundsRelative, $width, $height)
	// const circles = fitCircles(100, bounds, {diamLow: 200, diamHigh: 300});

</script>

<style>
	section {
		background-color: #595959;
		position: relative;
		overflow: hidden;
		background-color: green;
	}

	:global(body) {
		padding: 0;
	}
</style>


<section style="width: {$width}px; height: {$height}px;">
 	{#if $gameState == "gameStart"}
		<GameStart/>
	{:else if $gameState == "game"}
		<Game/>
	{:else}
		<GameEnd/>
	{/if}
</section>

<svelte:window bind:innerWidth={$width} bind:innerHeight={$height}/>