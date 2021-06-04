// resources
export const imgPath = "../assets/image/"

// ui
export const h1Size = "100px";
export const h2Size = "30px";
export const orange = "#D0B17E";
export const pink = "#DF84A7";

// game 
export const gameTickTime = 1000;
export const gameTimeUnit = 100;
export const gameEndTime = 3000;
export const gameStartDelay = 800;
export const gameBackgroundImgPath = imgPath + "background.jpg";

// level
export const fittingMinDiameter = 50;
export const fittingPadding = 15;
export const fittingAttempts = 800;
export const fittingDiameterRange = {low: 200, high: 350}
export const levelBounds = {x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8}

// mole
export const moleAmount = 125;
export const moleActivationChance = 0.5;
export const moleInactiveImgPath = imgPath + "mole_inactive.png";
export const moleActiveImgRange = ["4.png", "3.png", "2.png", "1.png"]
export const moleValueRange = [100, 40, 15, 5]
export const moleActivationChanceRange = [0.07, 0.18, 0.25, 0.37]
export const moleTypes = [{color: "white",
						   value: 100,
						   activationChance: 0.07,
						   imgSrc: "4.png"},
						  {color: "pink",
						   value: 40,
						   activationChance: 0.18,
						   imgSrc: "3.png"},
						  {color: "orange",
						   value: 15,
						   activationChance: 0.25,
						   imgSrc: "2.png"},
						  {color: "yellow",
						   value: 5,
						   activationChance: 0.37,
						   imgSrc: "1.png"}]						   						   
