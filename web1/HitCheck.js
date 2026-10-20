export function checkHit(x, y, r) {
    if (x > 0 && y > 0) {
        return false;
    }
    if (x >= 0 && y <= 0) {
        return x <= r && y >= -r;
    }
    if (y >= 0) {
        return y <= x + r;
    }
    return Math.sqrt(x * x + y * y) < r / 2;
}

