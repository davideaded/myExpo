import { Player } from './player.js';
import { Ray } from './ray.js';

// SETTINGS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 960;
canvas.height = 640;

const TILE_SIZE        = 64;
const GRID_ROW         = 10;
const GRID_COL         = 15;
const FOV              = 60 * (Math.PI / 180);
const RES              = 4;
const NUM_RAYS         = Math.floor((GRID_COL * TILE_SIZE) / RES);
const PROJECTION_PLANE = 830;
const WALL_HEIGHT      = TILE_SIZE;

// MAP
class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    }

    hasWallAt(x, y) {
        const row = Math.floor(y / TILE_SIZE);
        const col = Math.floor(x / TILE_SIZE);

        if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) {
            return true;
        }
        return this.grid[row][col] === 1;
    }

    render(ctx) {
        for (let i = 0; i < GRID_ROW; ++i) {
            for (let j = 0; j < GRID_COL; ++j) {
                ctx.fillStyle = this.grid[i][j] === 1 ? "#444" : "#ddd";
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
}

// IMAGES
const projectImages = {
    projects: [],

    loadImages() {
        const poke = { 
            image: new Image(),
            col: 9,
            row: 3,
        };
        poke.image.src = "./projects/poke.png";

        const fout = {
            image: new Image(),
            col: 7,
            row: 3
        };
        fout.image.src = "./projects/fout.png";

        const waldo = {
            image: new Image(),
            col: 5,
            row: 3
        };
        waldo.image.src = "./projects/wwaldo.png";

        const snake = {
            image: new Image(),
            col: 6,
            row: 6
        };
        snake.image.src = "./projects/snake.png";

        const toe = {
            image: new Image(),
            col: 8,
            row: 6
        };
        toe.image.src = "./projects/toe.png";

        this.projects.push(poke, fout, waldo, snake, toe);
    },
};
projectImages.loadImages();

// RAYCASTER
class Raycaster {
    constructor(player, map) {
        this.rays = [];
        this.player = player;
        this.map = map;
    }

    castAllRays() {
        this.rays = [];
        let rayAngle = this.player.rotationAngle - FOV / 2;
        for (let i = 0; i < NUM_RAYS; ++i) {
            const ray = new Ray(rayAngle, this.player, this.map);
            ray.cast(TILE_SIZE, GRID_COL * TILE_SIZE, GRID_ROW * TILE_SIZE);
            this.rays.push(ray);

            rayAngle += FOV / (NUM_RAYS - 1);
        }
    }

    render(ctx) {
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

        ctx.fillStyle = "#444";
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        let i = 0;
        for (let ray of this.rays) {

            let lineHeight = (WALL_HEIGHT / ray.distance) * PROJECTION_PLANE;
            let beginDraw = (canvas.height / 2) - (lineHeight / 2);
            let drawEnd = lineHeight;

            // PROJECT IMAGES
            ctx.imageSmoothingEnabled = false;
            const hitRow = Math.floor(ray.wallHitY / TILE_SIZE);
            const hitCol = Math.floor(ray.wallHitX / TILE_SIZE);
            const quadro = projectImages.projects.find(
                q => q.row === hitRow && q.col === hitCol
            );


            if (quadro && quadro.image.complete) {
                ctx.fillStyle = ray.color;
                ctx.fillRect(i * RES, beginDraw, RES, lineHeight);

                let textureX;
                if (ray.wasHitVertical) {
                    textureX = ray.wallHitY % TILE_SIZE;
                } else {
                    textureX = ray.wallHitX % TILE_SIZE;
                }

                textureX = Math.floor((textureX / TILE_SIZE) * quadro.image.width);

                ctx.drawImage(
                    quadro.image,
                    textureX, 0, 1, quadro.image.height,
                    i * RES, beginDraw, RES, lineHeight
                );
            } else {
                ctx.fillStyle = ray.color;
                ctx.fillRect(i * RES, beginDraw, RES, lineHeight);
            }
            i++;
        }
    }
}

// INSTANCES
const map = new Map();
const p1 = new Player(canvas.width / 2, canvas.height / 2, map);
const rc = new Raycaster(p1, map);

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
    p1.update();
    rc.castAllRays();
    rc.render(ctx);

    requestAnimationFrame(gameLoop);
}

window.onload = () => gameLoop();
