<script>
	import {fontName} from "./settings.js";
	export let text;
</script>

<style>
	h2 {
	 	font-size: 30px;
		font-family: var(--fontName), serif;    	
        font-style: bold;
        font-weight: 700;				
		color: white;
		text-align: center;
		padding-top: 30px;		
	}
</style>

<h2 style="--fontName: {fontName};">{text}</h2>

