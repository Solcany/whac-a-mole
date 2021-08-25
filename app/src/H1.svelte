<script>
	import {fontName} from "./settings.js";
	export let text;
</script>

<style>
	h1 {
	 	font-size: 80px;
		font-family: var(--fontName), serif;    	
        font-style: bold;
        font-weight: 700;		
		color: white;
		text-align: center;
		padding-top: 30px;		
		padding-bottom: 40px;	
	}
</style>

<h1 style="--fontName: {fontName};">{text}</h1>

