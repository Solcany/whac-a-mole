<script>
	import {onMount} from "svelte"
	import {currentAudioTrack} from "./store.js"
	export let src;
	let player;

	$: $currentAudioTrack, handleTrackUpdate();

	// function handleClick () {
	// 	player.play();
	// }

	// function handleKeyDown(event) {
	// 	if(event.key === key) {
	// 		player.play();
	// 	}
	// }

	function handleTrackUpdate() {
		if($currentAudioTrack.src === src) {
			console.log("play" + src);
			player.play();
		}
	}

</script>

<audio bind:this={player} {src}></audio>

<!-- <svelte:window on:keydown={handleKeyDown}/> -->