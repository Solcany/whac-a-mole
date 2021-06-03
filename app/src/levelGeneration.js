const MINR = 50;
const PADDING = 25;
const ATTEMPTS = 1000;

function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

function getRandomInRange(low, high) {
	return roundToTwo(Math.random() * (high - low) + low);
}

function rerange (value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export function getAbsoluteBounds(relativeBounds, width, height) {
	const {x1: rX1, y1: rY1, x2: rX2, y2: rY2} = relativeBounds;
	return {x1: rX1 * width, 
			y1: rY1 * height, 
			x2: rX2 * width, 
			y2: rY2 * height}		
}

function doCirclesOverlap (circle1, circle2) {
	const {x: c1X, y: c1Y, d: c1D} = circle1;
	const {x: c2X, y: c2Y, d: c2D} = circle2;
	const dist = Math.hypot(c2X-c1X, c2Y-c1Y);
	const c1R = c1D / 2;
	const c2R = c2D / 2;
	const rSum  = c1R + c2R;
	const rSumPadded = rSum + PADDING;
    return (dist <= rSumPadded) ? true : false;
}

export function getRandomCircle(bounds, diameter) {
	const {x1, y1, x2, y2} = bounds;
	const x = getRandomInRange(x1, x2);
	const y = getRandomInRange(y1, y2);
	return {x: x, y: y, d: diameter};
}

export function fitRandomCircle(circles, bounds, diameter, attempts) {
	const {x1, y1, x2, y2} = bounds
	for(let i = 0; i < attempts; i++) {
		const newDiameter = rerange(i, 0, attempts, diameter, MINR);
		const newCircle = getRandomCircle(bounds, newDiameter);
		const overlaps = circles.map( circle => doCirclesOverlap(circle, newCircle));
		if(overlaps.every(v => v == false)) {
			return newCircle;
		}
	}
}

export function fitCircles(circlesAmount, bounds, diameterRange) {
	const {diamLow, diamHigh} = diameterRange;
	const firstCircle = getRandomCircle(bounds, diamHigh);	
	let circles = [firstCircle];
	for(let i = 0; i < circlesAmount; i++) {
		const newDiameter = getRandomInRange(diamLow, diamHigh);
		const newCircle = fitRandomCircle(circles, bounds, newDiameter, ATTEMPTS);
		if(newCircle) {
			circles.push(newCircle);
		}
	}
	return circles;
}
