<script>
	import {h2Size} from "./settings.js"
	export let handleClick, text, imgSrc;
</script>

<style>
	button {
		background: none;
		outline: none;
		border: none;
	}
	button:hover {
		cursor: pointer;
	}
	button img {
		width: 200px;
		height: 200px;
		display: block;		
	}
	button span {
		display: block;
		color: white;
		text-align: center;
		font-size: var(--fontSize);
		font-family: gt_super;
	}
</style>

<button on:click={handleClick}>
	<img src="{imgSrc}">
	<span style="--fontSize:{h2Size}"> {text}</span>
</button>