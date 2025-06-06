function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }

    return angle;
}
export class Ray {
    constructor(rayAngle, player) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.player = player;
    }

    cast() {
    }
    render(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.moveTo(this.player.x, this.player.y);
        ctx.lineTo(this.player.x + Math.cos(this.rayAngle) * 100, this.player.y + Math.sin(this.rayAngle) * 100); 
        ctx.stroke();
    }
}
