<script>
import {gameScore} from './store.js';

$: liveScore = $gameScore.reduce((v, acc) => v + acc);

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
	<h2 class="liveScore">{liveScore}</h2>
</div>