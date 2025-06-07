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
    }

    cast(tileSize, gridWidth, gridHeight) {
        const angle = this.rayAngle;

        // horizontal
        let foundHorzWallHit = false;
        let horzWallHitX = 0;
        let horzWallHitY = 0;

        let yIntercept = Math.floor(this.player.y / tileSize) * tileSize;
        yIntercept += this.isFacingDown ? tileSize : 0;

        let xIntercept = this.player.x + (yIntercept - this.player.y) / Math.tan(angle);

        let yStep = tileSize;
        yStep *= this.isFacingUp ? -1 : 1;

        let xStep = tileSize / Math.tan(angle);
        xStep *= (this.isFacingLeft && xStep > 0) ? -1 : 1;
        xStep *= (this.isFacingRight && xStep < 0) ? -1 : 1;

        let nextHorzX = xIntercept;
        let nextHorzY = yIntercept;

        while (nextHorzX >= 0 && nextHorzX <= gridWidth && nextHorzY >= 0 && nextHorzY <= gridHeight) {
            const wallCheckX = nextHorzX;
            const wallCheckY = this.isFacingUp ? nextHorzY - 1 : nextHorzY;

            if (this.map.hasWallAt(wallCheckX, wallCheckY)) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzX;
                horzWallHitY = nextHorzY;
                break;
            } else {
                nextHorzX += xStep;
                nextHorzY += yStep;
            }
        }

        // vertical
        let foundVertWallHit = false;
        let vertWallHitX = 0;
        let vertWallHitY = 0;

        let xInterceptV = Math.floor(this.player.x / tileSize) * tileSize;
        xInterceptV += this.isFacingRight ? tileSize : 0;

        let yInterceptV = this.player.y + (xInterceptV - this.player.x) * Math.tan(angle);

        let xStepV = tileSize;
        xStepV *= this.isFacingLeft ? -1 : 1;

        let yStepV = tileSize * Math.tan(angle);
        yStepV *= (this.isFacingUp && yStepV > 0) ? -1 : 1;
        yStepV *= (this.isFacingDown && yStepV < 0) ? -1 : 1;

        let nextVertX = xInterceptV;
        let nextVertY = yInterceptV;

        while (nextVertX >= 0 && nextVertX <= gridWidth && nextVertY >= 0 && nextVertY <= gridHeight) {
            const wallCheckX = this.isFacingLeft ? nextVertX - 1 : nextVertX;
            const wallCheckY = nextVertY;

            if (this.map.hasWallAt(wallCheckX, wallCheckY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertX;
                vertWallHitY = nextVertY;
                break;
            } else {
                nextVertX += xStepV;
                nextVertY += yStepV;
            }
        }

        // dist
        const horzHitDist = foundHorzWallHit
            ? distanceBetween(this.player.x, this.player.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;

        const vertHitDist = foundVertWallHit
            ? distanceBetween(this.player.x, this.player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        if (horzHitDist < vertHitDist) {
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
        } else {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
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
