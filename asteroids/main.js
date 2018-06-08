/**
 * @type {Ship}
 */
var ship;
/**
 * @type {Asteroid[]}
 */
var asteroids = [];

/**
 * @type {number}
 */
var spawnCounter = 0;
const spawnAfter = 180;

function setup() {
    createCanvas(windowWidth, windowHeight - 5);

    initialize();
}

function initialize() {
    spawnCounter = 0;
    ship = new Ship();
    asteroids = Asteroid.Generate(1);
}

function draw() {
    background(5);

    // update positions
    ship.update();
    ship.bullets.forEach((b) => b.update());
    asteroids.forEach((a) => a.update());

    // build quadtree
    let tree = new QuadTree(new Rect(0, 0, width, height), 5);
    for (const a of asteroids) {
        let p = new Point(a.pos.x, a.pos.y);
        p.data = a; // attach asteroid
        tree.insert(p);
    }

    // perform collisions
    // first on asteroid-bullets
    let frags = [];
    for (const b of ship.bullets) {
        // bullet-asteroid collision
        let found = tree.query(new Rect(
            b.pos.x - 64, b.pos.y - 64,
            b.pos.x + 64, b.pos.y + 64));
        for (const p of found) {
            let a = p.data; // retrieve asteroid
            if (a.isAlive && b.isAlive && AABB(b, a) && CircleCircle(b, a)) {
                let f = a.applyDamage(b.power);
                frags.push(...f);
                b.isAlive = false;
            }
        }
    }

    // ship-asteroid collision
    let found = tree.query(new Rect(
        ship.pos.x - 64, ship.pos.y - 64,
        ship.pos.x + 64, ship.pos.y + 64));
    for (const p of found) {
        let a = p.data;
        if (AABB(ship, a) && CircleCircle(ship, a)) {
            ship.applyDamage(a.radius);
        }
    }

    // remove dead
    ship.bullets = ship.bullets.filter((b) => b.isAlive);
    let prevLen = asteroids.length;
    asteroids = asteroids.filter((a) => a.isAlive);
    ship.score += prevLen - asteroids.length;
    // add new
    asteroids.push(...frags);

    // spawn new large asteroids
    spawnCounter++;
    if (spawnCounter >= spawnAfter) {
        asteroids.push(...Asteroid.Generate(1));
        spawnCounter = 0;
        console.log(frameRate(), asteroids.length);
    }

    // check ship state. restart game if it's dead
    if (!ship.isAlive) {
        initialize();
    }

    // draw /////////////////////

    ship.bullets.forEach((b) => b.draw());
    asteroids.forEach((a) => a.draw());
    ship.draw();
}

/**
 * Performs Axis Aligned Bounding Box test on 2 objects.
 * @param {Ship|Asteroid|Bullet} a an object
 * @param {Ship|Asteroid|Bullet} b another object
 * @returns {boolean} true if the AABBs collide
 */
function AABB(a, b) {
    return !( // AABB test
        a.pos.x - a.radius > b.pos.x + b.radius ||
        a.pos.x + a.radius < b.pos.x - b.radius ||
        a.pos.y + a.radius < b.pos.y - b.radius ||
        a.pos.y - a.radius > b.pos.y + b.radius
    );
}

/**
 * Performed a circle-circle collision test.
 * @param {Ship|Asteroid|Bullet} a an object
 * @param {Ship|Asteroid|Bullet} b another object
 * @returns {boolean} true if the circles collide
 */
function CircleCircle(a, b) {
    return b.pos.dist(a.pos) <= a.radius + b.radius;
}