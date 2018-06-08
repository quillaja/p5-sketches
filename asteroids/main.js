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
    background(40);

    ship.update();
    ship.bullets.forEach((b) => b.update());
    asteroids.forEach((a) => a.update());

    let frags = [];
    for (const a of asteroids) {
        for (const b of ship.bullets) {
            if (b.pos.dist(a.pos) <= a.radius + b.radius) {
                // collision
                let f = a.applyDamage(1);
                frags.push(...f);
                b.isAlive = false;
            }
        }

        if (ship.pos.dist(a.pos) <= ship.radius + a.radius) {
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
    }

    if (!ship.isAlive) {
        initialize();
    }

    // draw

    ship.bullets.forEach((b) => b.draw());
    asteroids.forEach((a) => a.draw());
    ship.draw();
}