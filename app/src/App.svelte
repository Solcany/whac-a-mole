<script>
	import { title, gameBackgroundImgPath, gray } from './settings.js';
	
	import { gameState } from './store.js';

	import GameStart from './GameStart.svelte';    
	import Game from './Game.svelte'; 
	import GameEnd from './GameEnd.svelte';
</script>

<style>
	section {
		background-size: cover;
		background-color: var(--bgColor);
		background-image: var(--bgPath);
		position: relative;
		overflow: hidden;
		width: 100vw;
		min-width: 1024px;
		height: 100vh;
		min-width: 768px;
	}
	:global(body, h1, h2, img) {
		padding: 0;
		margin: 0;
	}
</style>

<section style="--bgPath: url({gameBackgroundImgPath}); --bgColor:{gray};">
 	{#if $gameState == "gameStart"}
		<GameStart/>
	{:else if $gameState == "game"}
		<Game/>
	{:else}
		<GameEnd/>
	{/if}
</section>

<svelte:head>
	<title>{title}</title>
	<html lang="en" />

	<style>
	@import url('https://fonts.googleapis.com/css2?family=Lora:wght@700&display=swap');
	</style>
</svelte:head>