<script>
	import GameStart from './GameStart.svelte';    
	import Game from './Game.svelte'; 
	import GameEnd from './GameEnd.svelte';        
	import Mole from './Mole.svelte';
	import { gameState } from './store.js';

	let width = window.innerWidth;
	let height = window.innerHeight;


</script>

<style>
	section {
		background-color: #595959;
		position: relative;
		overflow: hidden;
	}

	:global(body) {
		padding: 0;
	}
</style>


<section style="width: {width}px; height: {height}px;">
	{#if $gameState == "gameStart"}
		<GameStart/>
	{:else if $gameState == "game"}
		<Game>
			<Mole x=50 y=50 value=10/>
			<Mole x=100 y=100 value=10/>
			<Mole x=200 y=200 value=10/>
			<Mole x=300 y=300 value=10/>
		</Game>
	{:else}
		<GameEnd/>
	{/if}
</section>


<svelte:window bind:innerWidth={width} bind:innerHeight={height}/>