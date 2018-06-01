// Creates colorful circles that float around screen via perlin noise
// and change color when they intersect other circles.
//
// last edited 2018-05-23

var bubbles = []

function setup() {
    // set number of bubbles to a reasonable "density"
    const num_bubs = windowWidth * windowHeight / 16000;

    createCanvas(windowWidth, windowHeight - 5);
    colorMode(HSB)

    // create bubbles
    for (let i = 0; i < num_bubs; i++) {
        bubbles.push(new Bubble(
            random(width),
            random(height),
            random(10, 30)));
    }
}

function draw() {
    clear();
    background(0, 0, 30);

    // update bubble state and draw
    for (const b of bubbles) {
        b.update();
        b.draw();
    }

    // do intersections
    for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
            if (bubbles[i].intersects(bubbles[j])) {
                bubbles[i].changeColor();
                bubbles[j].changeColor();
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 5);
}

class Bubble {
    // a "constant" for the perlin noise offset increment.
    static get Offset() { return 0.01; }

    //a "constant" for any bubble's max speed.
    static get MaxSpeed() { return 3; }

    // Makes a bubble.
    constructor(x, y, r, col = color(0, 0, 100)) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.col = col;
        this._x_noise_offset = random(1000);
        this._y_noise_offset = random(1000);
    }

    // Update's the bubble's position.
    update() {
        // calc new position
        this.x += Bubble.MaxSpeed * (noise(this._x_noise_offset) * 2 - 1);
        this.y += Bubble.MaxSpeed * (noise(this._y_noise_offset) * 2 - 1);

        // move the noise offset ahead.
        this._x_noise_offset += Bubble.Offset;
        this._y_noise_offset += Bubble.Offset;

        // wrap bubble around edges
        if (this.x < 0) { this.x = width; }
        if (this.x > width) { this.x = 0; }
        if (this.y < 0) { this.y = height; }
        if (this.y > height) { this.y = 0; }
    }

    // Draws the bubble to the canvas.
    draw() {
        stroke(255);
        fill(this.col);
        ellipse(this.x, this.y, this.r * 2);
    }

    // Determines if this bubble intersects with the other.
    intersects(other) {
        let d = dist(this.x, this.y, other.x, other.y);
        return d <= (this.r + other.r);
    }

    // Gives the bubble a new random color.
    changeColor() {
        this.col = color(random(360), 100, 100);//, random(255), random(255));
    }
}