<script>
	//import { renderable } from './main.js';
	import {onMount, getContext} from 'svelte';

	export let x, y

	const {register, unregister} = getContext('drawApi')
	
	onMount(() => {
		register(draw)

		return () => {
			unregister(draw)
		}
	})

	function draw(context) {
	    context.fillStyle = "white";
	// context.textAlign = align;
	// context.textBaseline = baseline;		
		context.fillText("this is the life", x, y);		

	}

	// export let color = 'hsl(0, 0%, 100%)';
	// export let align = 'center';
	// export let baseline = 'middle';
	
	// export let text = '';
	// export let x = 0;
	// export let y = 0;
	
	// export let fontSize = 16;
	// export let fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica';
	
	// getContext(contextStore)

	// context.fillStyle = color;
	// context.textAlign = align;
	// context.textBaseline = baseline;		
	// context.fillText(text, x, y);	
</script>

<!-- The following allows this component to nest children -->
<slot></slot>
