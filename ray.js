function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle <= 0) {
        angle = (2 * Math.PI) + angle;
    }

    return angle;
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
}

export class Ray {
    constructor(rayAngle, player, map) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.player = player;
        this.map = map;

        this.isFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isFacingUp = !this.isFacingDown;
        this.isFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > Math.PI * 1.5;
        this.isFacingLeft = !this.isFacingRight;

        this.wallHitX = 0;
        this.wallHitY = 0;

        this.distance = 0;
    }

    cast(tileSize, gridWidth, gridHeight) {
        const angle = this.rayAngle;

        // horizontal
        let foundHWallHit = false;
        let hWallHitX = 0;
        let hWallHitY = 0;

        let yIntercept = Math.floor(this.player.y / tileSize) * tileSize;
        yIntercept += this.isFacingDown ? tileSize : 0;

        let xIntercept = this.player.x + (yIntercept - this.player.y) / Math.tan(angle);

        let yStep = tileSize;
        yStep *= this.isFacingUp ? -1 : 1;

        let xStep = tileSize / Math.tan(angle);
        xStep *= (this.isFacingLeft && xStep > 0) ? -1 : 1;
        xStep *= (this.isFacingRight && xStep < 0) ? -1 : 1;

        let nextHInterceptX = xIntercept;
        let nextHInterceptY = yIntercept;

        while (nextHInterceptX >= 0 && nextHInterceptX <= gridWidth && nextHInterceptY >= 0 && nextHInterceptY <= gridHeight) {
            const wallCheckX = nextHInterceptX;
            const wallCheckY = this.isFacingUp ? nextHInterceptY - 1 : nextHInterceptY;

            if (this.map.hasWallAt(wallCheckX, wallCheckY)) {
                foundHWallHit = true;
                hWallHitX = nextHInterceptX;
                hWallHitY = nextHInterceptY;
                break;
            } else {
                nextHInterceptX += xStep;
                nextHInterceptY += yStep;
            }
        }

        // vertical
        let foundVertWallHit = false;
        let vWallHitX = 0;
        let vWallHitY = 0;

        let xInterceptV = Math.floor(this.player.x / tileSize) * tileSize;
        xInterceptV += this.isFacingRight ? tileSize : 0;

        let yInterceptV = this.player.y + (xInterceptV - this.player.x) * Math.tan(angle);

        let xStepV = tileSize;
        xStepV *= this.isFacingLeft ? -1 : 1;

        let yStepV = tileSize * Math.tan(angle);
        yStepV *= (this.isFacingUp && yStepV > 0) ? -1 : 1;
        yStepV *= (this.isFacingDown && yStepV < 0) ? -1 : 1;

        let nextVInterceptX = xInterceptV;
        let nextVInterceptY = yInterceptV;

        while (nextVInterceptX >= 0 && nextVInterceptX <= gridWidth && nextVInterceptY >= 0 && nextVInterceptY <= gridHeight) {
            const wallCheckX = this.isFacingLeft ? nextVInterceptX - 1 : nextVInterceptX;
            const wallCheckY = nextVInterceptY;

            if (this.map.hasWallAt(wallCheckX, wallCheckY)) {
                foundVertWallHit = true;
                vWallHitX = nextVInterceptX;
                vWallHitY = nextVInterceptY;
                break;
            } else {
                nextVInterceptX += xStepV;
                nextVInterceptY += yStepV;
            }
        }

        // dist
        const hHitDist = foundHWallHit
            ? distanceBetween(this.player.x, this.player.y, hWallHitX, hWallHitY)
            : Number.MAX_VALUE;

        const vHitDist = foundVertWallHit
            ? distanceBetween(this.player.x, this.player.y, vWallHitX, vWallHitY)
            : Number.MAX_VALUE;

        if (hHitDist < vHitDist) {
            this.wallHitX = hWallHitX;
            this.wallHitY = hWallHitY;
            this.distance = hHitDist;
        } else {
            this.wallHitX = vWallHitX;
            this.wallHitY = vWallHitY;
            this.distance = vHitDist;
        }
    }


    render(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "yellow";
        ctx.moveTo(this.player.x, this.player.y);
        ctx.lineTo(this.wallHitX, this.wallHitY);
        ctx.stroke();
    }
}
