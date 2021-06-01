<script>
	import { onMount, onDestroy, setContext } from 'svelte';
	import {
		key,
		width,
		height,
		canvas as canvasStore,
		context as contextStore,
		pixelRatio
		//props,
		// time
	} from './main.js';

	let canvas;
	let context;

	let drawFunctions = [];
	let moles = [];

	setContext('drawApi', {
		register(drawFn) {
			drawFunctions.push(drawFn)
		},
		unregister(drawFn) {
			drawFunctions.splice(drawFunctions.indexOf(drawFn), 1)
		}
	});

	onMount(() => {
		context = canvas.getContext('2d');

		function update() {
			drawFunctions.forEach(drawFn => { drawFn(context) })
			frameId = requestAnimationFrame(update)
		}

		let frameId = requestAnimationFrame(update)

		return () => {
			cancelAnimationFrame(update)
		}
	})


	function handleMouseDown (ev) {
		let x = ev.offsetX // - canvas.offsetLeft;
        let y = ev.offsetY //- canvas.offsetTop;
        console.log(x, y)    
	}
</script>


<canvas
	on:click={handleMouseDown}
	bind:this={canvas}
	width={$width * $pixelRatio}
	height={$height * $pixelRatio}
	style="width: {$width}px; height: {$height}px; background-color: black;"
/>

<slot></slot>

