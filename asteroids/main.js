/**
 * @type {Ship}
 */
let ship;
/**
 * @type {Asteroid[]}
 */
let asteroids = [];

/**
 * @type {number}
 */
let spawnCounter = 0;
const spawnAfter = 180; // frames

let font;

function setup() {
    createCanvas(windowWidth, windowHeight - 10);

    initialize();

    // can't xss load using file:// protocol
    loadFont("PressStart2P.ttf",
        (f) => textFont(f),
        (e) => { textFont("VT323"); console.log("error with 'Press Start 2P': " + e); });
}

function initialize(restart = false) {
    if (restart) {
        let display = document.getElementById("score-display");
        let scoreList = document.getElementById("score-display-list");
        let playerScore = ship.score; // so the score can be captured by the anon funcs below

        document.getElementById("score-close-btn").onclick = () => {
            display.hidden = true;
            scoreList.innerHTML = "";
            let nameInput = document.getElementById("name-input");
            if (nameInput != null) {
                let name = String(nameInput.value);
                // console.log(name);
                if (name.length > 0) {
                    getByKey(API_KEY, "scores").then(scores => {
                        scores.push({ "name": name, "score": playerScore });
                        scores = scores.sort((a, b) => b.score - a.score).slice(0, 9);
                        putByKey(API_KEY, "scores", scores)
                            .then(/*v => console.log(v)*/)
                            .catch(e => console.log("didn't write scores: " + e));
                    });
                }
            }
            initialize();
        };

        getByKey(API_KEY, "scores").then((scores) => {

            const ynh = `TEXTBOX${random(100)}`;
            scores.push({ "name": ynh, "score": playerScore });
            let top10 = scores.sort((a, b) => b.score - a.score).slice(0, 9); // asc sort
            let innerhtml = "";
            for (const s of top10) {
                if (s.name == ynh) {
                    innerhtml += `<div class="score"><input id="name-input" class="score-name" type="text" placeholder="Enter your name"><div class="score-number">${s.score}</div></div>`;
                } else {
                    innerhtml += `<div class="score"><div class="score-name">${s.name}</div><div class="score-number">${s.score}</div></div>`;
                }
            }
            scoreList.innerHTML = innerhtml;
            scoreList.hidden = false;
        });

        display.hidden = false;
        document.getElementById("final-score").innerText = ship.score.toString();
    }

    spawnCounter = 0;
    if (restart) { ship.isGod = true; ship.isAlive = true; ship.shields = 0; }
    else { ship = new Ship(); }
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
    let maxCollisionTests = 0;
    for (const b of ship.bullets) {
        // bullet-asteroid collision
        let found = tree.query(new Rect(
            b.pos.x - 64, b.pos.y - 64,
            b.pos.x + 64, b.pos.y + 64));
        maxCollisionTests += found.length;
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
    maxCollisionTests += found.length;
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
        // console.log(
        //     ceil(frameRate()),
        //     asteroids.length,
        //     maxCollisionTests);
    }

    // check ship state. restart game if it's dead
    if (!ship.isAlive) {
        initialize(true);
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