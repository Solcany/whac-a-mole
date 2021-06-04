<script>
import {gameScore} from './store.js';
import H2 from './H2.svelte';

$: liveScore = getTotalScore($gameScore);

function getTotalScore(score) {
	return score.reduce((v, acc) => v + acc);
}
</script>

<style>
	div.scoreContainer {
		z-index: 999;
		position: absolute;
		pointer-events: none;
		top: 0 ;
		width: 100%;
		user-select: none;		
	}
	h2.liveScore {
		width: 100%;
		text-align: center;
		font-size: 30px;
		color: white;
		pointer-events: none;
		user-select: none;
	}
</style>

<div class="scoreContainer">
	<H2 text="{liveScore}"/>
</div>