<script>
import { onMount, onDestroy } from 'svelte';
import Mole from './Mole.svelte';

import { gameTickTime, gameEndTime } from './settings.js'
import { gameState } from './store.js'
import { gameTicker } from './store.js'

let gameLoopInterval

onMount(() => {
	startGameLoop()
})

onDestroy(() => {
	resetTicker();
	clearInterval(gameLoopInterval);
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

// onMount(() => {

// }
//console.log(gameTicker);

// function gameLoop() {
// 	console.log()
// 	setTimeout(gameLoop, gameTick)
// }

//onMount(() => {
	//gameLoop()
//})

</script>


<slot></slot>



