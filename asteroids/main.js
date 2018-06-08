var ship;
var asteroids = [];

var spawnCounter = 0;
const spawnAfter = 180;

function setup() {
    createCanvas(windowWidth, windowHeight - 10);

    initialize();
}

function initialize() {
    spawnCounter = 0;
    ship = new Ship();
    asteroids = Asteroid.Generate(1);
}

function draw() {
    background(5);

    ship.update();
    ship.bullets.forEach((b) => b.update());
    asteroids.forEach((a) => a.update());

    let frags = [];
    for (const a of asteroids) {
        if (!a.isAlive) { continue; }
        for (const b of ship.bullets) {
            if (b.isAlive &&
                !( // AABB test
                    a.pos.x - a.radius > b.pos.x + b.radius ||
                    a.pos.x + a.radius < b.pos.x - b.radius ||
                    a.pos.y + a.radius < b.pos.y - b.radius ||
                    a.pos.y - a.radius > b.pos.y + b.radius
                ) && // circle-circle test
                b.pos.dist(a.pos) <= a.radius + b.radius) {
                // collision
                let f = a.applyDamage(b.power);
                frags.push(...f);
                b.isAlive = false;
            }
        }

        if (!( // AABB test
            a.pos.x - a.radius > ship.pos.x + ship.radius ||
            a.pos.x + a.radius < ship.pos.x - ship.radius ||
            a.pos.y + a.radius < ship.pos.y - ship.radius ||
            a.pos.y - a.radius > ship.pos.y + ship.radius
        ) && // circle-circle test
            ship.pos.dist(a.pos) <= ship.radius + a.radius) {
            // ship collision
            ship.applyDamage(a.radius);
        }
    }

    // console.log(frags);

    // remove dead
    ship.bullets = ship.bullets.filter((b) => b.isAlive);
    let prevLen = asteroids.length;
    asteroids = asteroids.filter((a) => a.isAlive);
    ship.score += prevLen - asteroids.length;
    // add new
    asteroids.push(...frags);

    spawnCounter++;
    if (spawnCounter >= spawnAfter) {
        asteroids.push(...Asteroid.Generate(1));
        spawnCounter = 0;
        // console.log(frameRate());
    }

    if (!ship.isAlive) {
        initialize();
    }

    // draw

    ship.bullets.forEach((b) => b.draw());
    asteroids.forEach((a) => a.draw());
    ship.draw();
}