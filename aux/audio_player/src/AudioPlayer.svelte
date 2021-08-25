<script>
	import {onMount} from 'svelte'
	import {currentAudioTrack} from './store.js'

	export let src, key;
	let player


	// function handleClick () {
	// 	player.play();
	// }

	function handleKeyDown(event) {
		if (player.duration > 0 && !player.paused) {
			//console.log("playing!");
		} else {
			//console.log("paused!");
		}
		if(event.key === key) {
			player.play();
		}
	}

</script>

<style>


</style>


<div>
	<audio
		bind:this={player}
		 {src}>
	</audio>
</div>

<svelte:window on:keydown={handleKeyDown}/>