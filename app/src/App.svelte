<script>
	import GameStart from './GameStart.svelte';    
	import Game from './Game.svelte'; 
	import GameEnd from './GameEnd.svelte';
	import { gameBackgroundImgPath } from './settings.js';

	import { gameState } from './store.js';

</script>

<style>
    @font-face {
        font-family: 'gt_super';
        font-style: normal;
        font-weight: 400;
        /*src: local("../public/assets/fonts/gt.woff");*/
        src: url("./gt.woff") format("woff");
    }

	section {
		background-size: cover;
		background-color: #565556;
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


<section style="--bgPath: url({gameBackgroundImgPath});">
 	{#if $gameState == "gameStart"}
		<GameStart/>
	{:else if $gameState == "game"}
		<Game/>
	{:else}
		<GameEnd/>
	{/if}
</section>