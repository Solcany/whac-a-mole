<script>
	import {fontName} from "./settings.js";	
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
		font-size: 30px;
		font-family: var(--fontName), serif;    	
        font-style: bold;
        font-weight: 700;
    }
</style>

<button on:click={handleClick}>
	<img src="{imgSrc}">
	<span style="--fontName: {fontName};"> {text}</span>
</button>