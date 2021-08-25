<script>
import {gameState, gameScore} from "./store.js";
import {moleTypes, fontName} from "./settings.js";

import AudioButton from "./AudioButton.svelte";
import H1 from "./H1.svelte";
import H2 from "./H2.svelte";
import Footer from "./Footer.svelte";

const totalScore = getTotalScore()
const molesScores = getMolesScores();

function playAgain() {
	gameState.set("game");
	gameScore.set([0]);
}

function getTotalScore() {
	return $gameScore.reduce((v, acc) => v + acc);
}

function getMolesScores() {
	return moleTypes.map((moleType) => {
		const value = moleType.value;
		const occurences = $gameScore.filter((v) => v == value);
		let sum, amount;
		if(occurences === undefined || occurences.length == 0) {
			sum = 0;
			amount = 0;
		} else {
			sum = occurences.reduce((v, acc) => v + acc);
			amount = occurences.length;								
		}
		const moleStats = {type: moleType, score: sum, amount: amount}
		return moleStats});
}

</script>

<style>

div.main {
	position: relative;
 	width: 100%;
 	height: 100vh;
 	display: flex;
 	flex-direction: column;
 	align-items: center;
 	justify-content: space-between;
}

span.moleScore {
	font-family: var(--fontName), serif;    	
    font-style: bold;
    font-weight: 700;	
 	color: white;
 	font-size: 30px;		
 	display: flex;
 	align-items: center;
}
span.moleScore:last-child {
	padding-bottom: 40px;
	border-bottom: 1px solid white;
}
span.moleScore img {
 	width: 75px;
 	height: 75px;
 	display: inline-block;
}

</style>

<div class="main">
	<H1 text="Whac' A Mole"/>
	<div>
		<div>
		{#each molesScores as moleScore}
		<span class="moleScore" style="--fontName: {fontName};">
			<img src="{moleScore.type.imgSrc}">
			<span>
				{#if moleScore.amount == 1}
					{moleScore.amount} mole for {moleScore.score} points
				{:else}
					{moleScore.amount} moles for {moleScore.score} points
				{/if}
 			</span>
		</span>
		{/each}
		</div>
		<H2 text="Your total score is {totalScore}!"/>
	</div>
	<nav>
		<AudioButton clickAction={playAgain} text="Play again" imgSrc="./assets/image/mole_active_4.png" audioSrc="../assets/sound/01.mp3"/>
	</nav>
	<Footer/>
</div>

