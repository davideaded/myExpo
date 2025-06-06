import { Player } from './player.js';
import { Ray } from './ray.js';

// SETTINGS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 640;

const TILE_SIZE     = 64;
const GRID_ROW      = canvas.height / TILE_SIZE;
const GRID_COL      = canvas.width  / TILE_SIZE;
const FOV           = 60 * (Math.PI / 180);
const RES           = 4;
const NUM_RAYS      = Math.floor(canvas.width / RES);
const ORIGINAL_GRID = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const GRID = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// MAP
function renderMap(ctx, grid) {
    for (let i = 0; i < GRID_ROW; ++i) {
        for (let j = 0; j < GRID_COL; ++j) {
            ctx.fillStyle = grid[i][j] === 1 ? "#444" : "#ddd";
            ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    ctx.strokeStyle = "black";
    for (let i = 0; i <= canvas.width; i += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    for (let i = 0; i <= canvas.height; i += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

}

// RAYCASTER
class Raycaster {
    constructor(player) {
        this.rays = [];
        this.player = player;
    }

    castAllRays() {
        this.rays = [];
        let rayAngle = this.player.rotationAngle - FOV / 2;
        for (let i = 0; i < NUM_RAYS; ++i) {
            const ray = new Ray(rayAngle, this.player);
            // ray.cast();
            this.rays.push(ray);

            rayAngle += FOV / NUM_RAYS
        }
    }

    render(ctx) {
        for (let ray of this.rays) {
            ray.render(ctx);
        }
    }
}

// PLAYER
const p1 = new Player(canvas.width / 2, canvas.height / 2 );
const rc = new Raycaster(p1);

// COMMANDS
document.addEventListener("keydown", (e) => {
    if (e.key === "w") p1.walkDirection = 1;
    if (e.key === "s") p1.walkDirection = -1;
    if (e.key === "a") p1.turnDirection = -1;
    if (e.key === "d") p1.turnDirection = 1;
});
document.addEventListener("keyup", (e) => {
    if (["w", "s"].includes(e.key)) p1.walkDirection = 0;
    if (["a", "d"].includes(e.key)) p1.turnDirection = 0;
});


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMap(ctx, GRID);

    p1.update();
    p1.render(ctx);

    rc.castAllRays();
    rc.render(ctx);

    requestAnimationFrame(gameLoop);
}
gameLoop();
