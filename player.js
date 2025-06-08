export class Player {
    constructor(x, y, map) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.turnDirection = 0;
        this.walkDirection = 0;
        this.rotationAngle = 0;
        this.moveSpeed = 2.5;
        this.rotationSpeed = 0.05;
        this.map = map;
    }

    update() {
        const moveStep = this.walkDirection * this.moveSpeed;
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        const newX = this.x + Math.cos(this.rotationAngle) * moveStep;
        const newY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (!this.map.hasWallAt(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    render(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = "red";
        ctx.fill();

        // ctx.beginPath();
        // ctx.moveTo(this.x, this.y);
        // ctx.strokeStyle = "red";
        // ctx.lineTo(this.x + Math.cos(this.rotationAngle) * 100, this.y + Math.sin(this.rotationAngle) * 100);
        // ctx.stroke();
    }
}
