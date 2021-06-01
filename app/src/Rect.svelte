<script>
	import {onMount, getContext} from 'svelte';
	export let x, y

	const {register, unregister} = getContext('drawApi')
	
	onMount(() => {
		register(draw)

		return () => {
			unregister(draw)
		}
	})

	function draw() {

	}

</script>

<slot></slot>