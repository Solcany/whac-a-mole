import {imgPath,
		fittingMinDiameter, 
		fittingPadding, 
		fittingAttempts,
		fittingDiameterRange,
		levelBounds,
		moleAmount,
		moleValueRange,
		moleActiveImgRange,
		moleActivationChanceRange} from "./settings.js"

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

function getRandomInRange(low, high) {
	return Math.random() * (high - low) + low;
}

function rerange (value, inLow, inHigh, outLow, outHigh) {
    return (value - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
}

export function matchItemWithinRange(value, inLow, inHigh, items) {
	const step = (inHigh - inLow) / items.length
	for(let i = 0; i < items.length; i++) {
		let limitLow = step * i + inLow
		let limitHigh = step * (i + 1) + inLow
		if(value >= limitLow && value <= limitHigh) {
			return items[i]
		}
	}
}

function getAbsoluteBounds(relativeBounds, width, height) {
	const {x1: rX1, y1: rY1, x2: rX2, y2: rY2} = relativeBounds;
	return {x1: rX1 * width, 
			y1: rY1 * height, 
			x2: rX2 * width, 
			y2: rY2 * height}		
}

function doCirclesOverlap (circle1, circle2) {
	const {x: c1X, y: c1Y, diameter: c1D} = circle1;
	const {x: c2X, y: c2Y, diameter: c2D} = circle2;
	const dist = Math.hypot(c2X-c1X, c2Y-c1Y);
	const c1R = c1D / 2;
	const c2R = c2D / 2;
	const rSum  = c1R + c2R;
	const rSumPadded = rSum + fittingPadding;
    return (dist <= rSumPadded) ? true : false;
}

function getRandomCircle(bounds, diameter) {
	const {x1, y1, x2, y2} = bounds;
	const x = roundToTwo(getRandomInRange(x1, x2));
	const y = roundToTwo(getRandomInRange(y1, y2));
	return {x: x, y: y, diameter: diameter};
}

function fitRandomCircle(circles, bounds, diameter, attempts) {
	const {x1, y1, x2, y2} = bounds
	for(let i = 0; i < attempts; i++) {
		const newDiameter = roundToTwo(rerange(i, 0, attempts, diameter, fittingMinDiameter));
		const newCircle = getRandomCircle(bounds, newDiameter);
		const overlaps = circles.map( circle => doCirclesOverlap(circle, newCircle));
		if(overlaps.every(v => v == false)) {
			return newCircle;
		}
	}
}

function fitCircles(circlesAmount, bounds, diameterRange) {
	const {low: diamLow, high: diamHigh} = diameterRange;
	const firstCircle = getRandomCircle(bounds, diamHigh);	
	let circles = [firstCircle];
	for(let i = 0; i < circlesAmount; i++) {
		const newDiameter = roundToTwo(getRandomInRange(diamLow, diamHigh));
		const newCircle = fitRandomCircle(circles, bounds, newDiameter, fittingAttempts);
		if(newCircle) {
			circles.push(newCircle);
		}
	}
	return circles;
}


function getMolesFromCircles(circles) {
	circles.map((circle) => {
		const diameter = circle.diameter;
		const value = matchItemWithinRange(diameter,
										   fittingMinDiameter,
										   fittingDiameterRange.high,
										   moleValueRange);
		const activeImgSrc = matchItemWithinRange(diameter,
										  		  fittingMinDiameter,
										  		  fittingDiameterRange.high,
										  		  moleActiveImgRange);
		const activationChance = matchItemWithinRange(diameter,
										   fittingMinDiameter,
										   fittingDiameterRange.high,
										   moleActivationChanceRange);		
		let mole = circle;
			mole.value = value;
			mole.activeImgSrc = activeImgSrc;
			mole.activationChance = activationChance;

		return mole;
	})
}

export function generateMoles(width, height) {
	const absBounds = getAbsoluteBounds(levelBounds, width, height);
	const circles = fitCircles(moleAmount, absBounds, fittingDiameterRange);
	const moles = getMolesFromCircles(circles);
	return circles;
}


