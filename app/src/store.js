import { get, readable, writable } from 'svelte/store';
import { gameTickTime } from './settings.js';

export const width = writable(window.innerWidth);
export const height = writable(window.innerHeight);

export const gameState = writable("gameStart") // gameStart, game, gameEnd
export const gameTicker = writable(0)
export const gameScore = writable(0)

// export const gameTicker = readable(0, function start(set) {
// 	const interval = setInterval((v) => {
// 		set(get(gameTicker) + gameTickTime);
// 	}, gameTickTime);
// 	return function stop() {
// 		clearInterval(interval);
// 	};
// });

