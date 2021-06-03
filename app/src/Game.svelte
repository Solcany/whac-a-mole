<script>
import { onMount, onDestroy } from 'svelte';
import { fade } from 'svelte/transition';

import ProgressBar from './ProgressBar.svelte';
import LiveScore from './LiveScore.svelte';
import Mole from './Mole.svelte';

import { gameTimeUnit, gameTickTime, gameEndTime } from './settings.js'
import { generateMoles } from './moleGenerator.js';
import { gameState, 
		 gameTime, 
		 width, 
		 height } from './store.js'

const moles = generateMoles($width, $height);

let gameLoopInterval
onMount(() => {
	setTimeout(()=> {
		startGameLoop()		
	}, 1500)
})
onDestroy(() => {
	resetTime();
})

function startGameLoop() {
	gameLoopInterval = setInterval(() =>  {
					handleTime()
					updateTime()
				}, gameTimeUnit)
}
function handleTime() {
	if($gameTime >= gameEndTime) {
		clearInterval(gameLoopInterval);	
		gameState.set("gameEnd")
	}
}

function updateTime() {
	gameTime.update(t => t + gameTimeUnit)
}

function resetTime() {
	gameTime.set(0)
}

</script>

<style>
 div {
 	width: 100%;
 	height: 100%;
 	position: relative;
 }
</style>


<div transition:fade="{{duration: 500}}">
	<LiveScore/>
	{#each moles as mole}
		<Mole {...mole}/>
	{/each}
	<ProgressBar/>
</div>





