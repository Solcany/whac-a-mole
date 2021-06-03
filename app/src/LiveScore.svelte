<script>
// import {pink, orange} from './settings.js';	
import {gameScore} from './store.js';

//$: gameScore, handleScoreChange();

// const progressTweened = tweened(0);
// $: progressTweened.set(progress);

</script>

<style>
	div.scoreContainer {
		z-index: 999;
		position: absolute;
		pointer-events: none;
		top: 0 ;
		width: 100%;
	}

	h2.liveScore {
		width: 100%;
		text-align: center;
		color: white;
	}

</style>

<div class="scoreContainer">
	<h2 class="liveScore">{$gameScore}</h2>
</div>