<script>
import { onMount, onDestroy } from 'svelte';
import ProgressBar from './ProgressBar.svelte';
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
	startGameLoop()
})
onDestroy(() => {
	clearInterval(gameLoopInterval);	
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

{#each moles as mole}
	<Mole {...mole}/>
{/each}
<ProgressBar/>





