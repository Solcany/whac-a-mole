<script>
import { get } from 'svelte/store';
import { onMount } from 'svelte';
import Mole from './Mole.svelte';

import { tickSpeed, gameCycleTime, gameEndTime } from './gameSettings.js'
import { gameState } from './gameState.js'

$: width = window.innerWidth;
$: height = window.innerHeight;


function gameLoop() {
	gameState.update(state => !state);
	setTimeout(gameLoop, tickSpeed)
}

onMount(() => {
	gameLoop()
})


</script>

<style>
	section {
		background-color: red;
		position: relative;
		overflow: hidden;
	}
</style>

<section style="width: {width}px; height: {height}px;">
	<slot></slot>
</section>

<svelte:window bind:innerWidth={width} bind:innerHeight={height}/>


