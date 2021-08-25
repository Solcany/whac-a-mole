<script>
	import AudioPlayer from "./AudioPlayer.svelte"

	const tracks = ["../sound/01.mp3", 
					"../sound/02.mp3",
					"../sound/03.mp3",
					"../sound/04.mp3",
					"../sound/05.mp3"]

	const keys = ["q", "w", "e", "r", "t"];				

	const data  = tracks.map(function (track, i) { 
                          return {track: track, key: keys[i]}
                      });


</script>


<main>

	{#each data as d}
		<AudioPlayer src={d.track} key={d.key}/>
	{/each}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>