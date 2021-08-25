// resources
export const imgPath = "../assets/image/"
export const audioPath = "../assets/sound/"

// game 
export const gameTickTime = 1250;
export const gameTimeUnit = 50;
export const gameEndTime = 20000;
export const gameStartDelayTime = 500;
export const gameBackgroundImgPath = imgPath + "background.jpg";

// level
export const fittingMinDiameter = 50;
export const fittingPadding = 15;
export const fittingAttempts = 800;
export const fittingDiameterRange = {low: 200, high: 400}
export const levelBounds = {x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8}

// mole
export const moleAmount = 70;
export const moleInactiveImgPath = imgPath + "mole_inactive.png";
export const moleTypes = [
	{
		value: 100,
		activationChance: 0.03,
		imgSrc: imgPath + "mole_active_4.png",
		audioSrc: audioPath + "01.mp3" 
	},
	{
		value: 40,
		activationChance: 0.23,
		imgSrc: imgPath + "mole_active_3.png",
		audioSrc: audioPath + "02.mp3" 

	},
	{
		value: 20,
		activationChance: 0.28,
		imgSrc: imgPath + "mole_active_2.png",
		audioSrc: audioPath + "03.mp3" 

	},
	{
		value: 10,
		activationChance: 0.45,
		imgSrc: imgPath + "mole_active_1.png",
		audioSrc: audioPath + "04.mp3" 		
	}
]	
						   					   						   
// ui
export const orange = "#D0B17E";
export const pink = "#DF84A7";
export const gray = "#565556";
export const transitionTime = 500;
export const fontName = 'Lora';	

// audio

export const audioFadeTick = 0.08
export const audioResetThresh = 0.1


