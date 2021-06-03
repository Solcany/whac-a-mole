<script>
import { tweened } from 'svelte/motion';
import {gameEndTime} from './settings.js';	
import {width, gameTime} from './store.js';

$: progress = Math.floor(100 / gameEndTime * $gameTime);
const progressTweened = tweened(0);
$: progressTweened.set(progress);

</script>

<style>
	div.progressContainer {
		z-index: 999;
		position: absolute;
		pointer-events: none;
		bottom: 0 ;
		width: 100%;
		height: 10px;
	}

	div.progressBar {
		width: 0;
		height: 100%;
		background-color: navy;
	}

</style>

<div class="progressContainer">
	<div class="progressBar" style="width: {$progressTweened}%;">
	</div>
</div>