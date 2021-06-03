<script>
import { onMount, onDestroy } from 'svelte';
import Mole from './Mole.svelte';

import { gameTickTime, gameEndTime } from './settings.js'
import { generateMoles } from './moleGenerator.js';
import { gameState, 
		 gameTicker, 
		 width, 
		 height } from './store.js'

const moles = generateMoles($width, $height);

let gameLoopInterval
onMount(() => {
	startGameLoop()
})
onDestroy(() => {
	clearInterval(gameLoopInterval);	
	resetTicker();
})

function startGameLoop() {
	gameLoopInterval = setInterval(() =>  {
					handleTicks()
					updateTicker()
				}, gameTickTime)
}
function updateTicker() {
	gameTicker.update(t => t + gameTickTime)
}

function resetTicker() {
	gameTicker.set(0)
}

function handleTicks() {
	console.log($gameTicker);
	if($gameTicker >= gameEndTime) {
		gameState.set("gameEnd")
	}
}
</script>

{#each moles as mole}
	<Mole {...mole}/>
{/each}






