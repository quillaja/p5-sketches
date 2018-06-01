// This sketch implements simple boids using the forces of cohesion,
// separation, and alignment, wander, and avoidance.
//
// last edited 2018-05-23

// the boids
var boids = [];
var badBoids = [];

function setup() {
    const boidDensity = 120; // "cubic pixels"
    const numBoids = windowWidth * windowHeight / (boidDensity * boidDensity);

    createCanvas(windowWidth, windowHeight - 5);

    // make regular ('good') boids.
    for (let i = 0; i < numBoids * 0.6; i++) {
        boids.push(new Boid(random(width), random(height)));
    }
    // make 'bad' boids.
    for (let i = 0; i < numBoids * 0.3; i++) {
        badBoids.push(new Boid(random(width), random(height)));
    }
}

function draw() {
    // draw --------------
    background(50);
    for (const b of boids) {
        b.draw();
    }
    for (const b of badBoids) {
        b.draw('red');
    }

    // update state -------

    // put boids in grid
    let gw = Math.floor(width / 200);
    let gh = Math.floor(gw * width / height);
    let grid = new Grid(gw, gh, width, height);
    for (const b of boids) {
        let [c, r] = grid.worldToGrid(b.pos.x, b.pos.y);
        grid.insert(c, r, b);
    }
    // create grid for bad boids with same params
    let badGrid = new Grid(gw, gh, width, height);
    for (const b of badBoids) {
        let [c, r] = badGrid.worldToGrid(b.pos.x, b.pos.y);
        badGrid.insert(c, r, b);
    }

    // run boid forces on boids in each bucket
    for (const b of boids) {
        let [c, r] = grid.worldToGrid(b.pos.x, b.pos.y);
        let bucket = grid.get(c, r);
        b.applyCohesion(bucket);
        b.applySeparation(bucket);
        b.applyAlignment(bucket);
        b.applyWander();

        // avoid all bad boids in same grid
        for (const bad of badGrid.get(c, r)) {
            b.applyAvoidance(bad.pos.x, bad.pos.y);
        }

        b.updatePosition();
    }

    // process bad boids
    for (const b of badBoids) {
        let [c, r] = badGrid.worldToGrid(b.pos.x, b.pos.y);
        let bucket = badGrid.get(c, r);
        b.applyCohesion(bucket);
        b.applySeparation(bucket);
        b.applyAlignment(bucket);
        b.applyWander();
        // make bad boids avoid the mouse
        b.applyAvoidance(mouseX, mouseY);

        b.updatePosition();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}