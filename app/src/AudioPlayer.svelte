<script>
	import {onMount} from "svelte"
	import {currentAudioTrack} from "./store.js"
	import {audioFadeTick,
			audioResetThresh} from './settings.js';	

	export let src;
	let player;

	$: $currentAudioTrack, handleTrackUpdate();

	function handleTrackUpdate() {
		if($currentAudioTrack.src === src) {
			if (player.duration > 0 && !player.paused) {
			   var resetPlayer = setInterval(function () {
			        if (player.volume > audioResetThresh) {
			            player.volume -= audioFadeTick;
			        }
			        if (player.volume < audioResetThresh) {
						player.pause();
						player.currentTime = null;	
			            player.volume = 1.0;			
						player.play();
			            clearInterval(resetPlayer);
			        }
			    }, 20);
			} else {
				player.play();
			}
		}
	}
</script>

<audio bind:this={player} {src}></audio>