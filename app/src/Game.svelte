<script>
import { onMount, onDestroy } from 'svelte';
import { fade } from 'svelte/transition';

import { transitionTime,
	     gameTimeUnit, 
		 gameTickTime, 
		 gameEndTime,
		 gameStartDelayTime } from './settings.js'
import { generateMoles } from './moleGenerator.js';

import { gameState, gameTime } from './store.js'

import ProgressBar from './ProgressBar.svelte';
import LiveScore from './LiveScore.svelte';
import Mole from './Mole.svelte';



const moles = generateMoles(window.innerWidth, window.innerHeight);

let gameLoopInterval;

onMount(() => {
	setTimeout(()=> {
		startGameLoop();		
	}, gameStartDelayTime);
});
onDestroy(() => {
	resetTime();
});
function startGameLoop() {
	gameLoopInterval = setInterval(() =>  {
					handleTime();
					updateTime();
				}, gameTimeUnit);
}
function handleTime() {
	if($gameTime >= gameEndTime) {
		clearInterval(gameLoopInterval);
		setTimeout(()=> {
			gameState.set("gameEnd");		
		}, gameStartDelayTime);
	}
}
function updateTime() {
	gameTime.update(t => t + gameTimeUnit);
}
function resetTime() {
	gameTime.set(0);
}
</script>

<style>
	div {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>

<div transition:fade="{{duration: transitionTime}}">
	<LiveScore/>
	{#each moles as mole}
		<Mole {...mole}/>
	{/each}
	<ProgressBar/>
</div>





