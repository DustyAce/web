export function checkHit(x, y, r) {
	if ( x >= 0 && y >= 0) {
		return Math.sqrt(x**2 + y**2) <= r;
	}
	if ( x >= 0 && y < 0 ) {
		return r >= x-y;
	}
	if ( y >= 0 ) {
		return x > -r/2 && y < r;
	}
	return false;
}

