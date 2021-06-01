<script>
    import { onMount } from 'svelte';
	import Game from './Game.svelte';    
	import Mole from './Mole.svelte';
</script>

<style>
	:global(body) {
		padding: 0;
	}
</style>

<Game>
	<Mole x=50 y=50/>
</Game>
