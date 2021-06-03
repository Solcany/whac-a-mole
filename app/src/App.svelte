<script>
	import GameStart from './GameStart.svelte';    
	import Game from './Game.svelte'; 
	import GameEnd from './GameEnd.svelte';
	import { gameBackgroundImgPath } from './settings.js';        
	import { width, 
			 height, 
			 gameState} from './store.js';

</script>

<style>
	section {
		background-size: cover;
		background-color: #565556;
		background-image: var(--bgPath);
		position: relative;
		overflow: hidden;
	}
	:global(body) {
		padding: 0;
	}
	:global(h1, h2) {
		margin: 0;
	}
	
</style>


<section style="width: {$width}px; height: {$height}px; --bgPath: url({gameBackgroundImgPath});">
 	{#if $gameState == "gameStart"}
		<GameStart/>
	{:else if $gameState == "game"}
		<Game/>
	{:else}
		<GameEnd/>
	{/if}
</section>

<svelte:window bind:innerWidth={$width} bind:innerHeight={$height}/>