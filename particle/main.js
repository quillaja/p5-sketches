var gen;

function setup() {
    createCanvas(windowWidth, windowHeight - 5);
    gen = new Generator(width / 2, height, 1, 400,
        () => p5.Vector.fromAngle(random(-1 / 3 * PI, -2 / 3 * PI)).mult(4),
        () => 30,
        () => color(255));
}

function draw() {
    background(50);

    fill(255);
    text("particle count: " + gen.particles.length, 10, 16);
    text("fps: " + round(frameRate()), 10, 32);

    // gen.forEach(g => g.update(random(width), height).draw());
    gen.update().draw();

}

function mouseClicked() {
    if (gen.isFinished()) {
        gen.activate();
    } else {
        gen.finish();
    }

}