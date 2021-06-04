import { get, readable, writable } from 'svelte/store';
import { gameTickTime } from './settings.js';

export const gameState = writable("gameStart")
export const gameTime = writable(0)
export const gameScore = writable([0])
