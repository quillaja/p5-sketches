// Circle/shape packing based on paper written by Paul Bourke.
//
// Title: "Space Filling: A new algorithm for procedural creation of game assets".
// Link: http://www.paulbourke.net/papers/cgat2013/paper.pdf
//
// Written 2018-06 by Ben (https://github.com/quillaja)


// constants and variables use in the algorithm
// i found these constants to produce reasonable results with resonable
// performance in a resonable amount of time.
const coefficent = 1.089; // determines how quickly the area shrinks
const percArea = 0.11; // porportion of total area a0 (0-th circle) will be
const maxAttempts = 200; // times to try inserting a circle before giving up

let a0; // area of 0-th (initial) circle
let g; // function that calculates area of i-th circle
let circles; // list of Circles
let gaveUp = false; // if the area has been fully packed

// variables to control display
let DO3D = false; // "3D mode"
let rotation; // rotation of the objects
let orthPersp = true; // true=ortho; false=perspective


function setup() {
    createCanvas(windowWidth, windowHeight - 5, WEBGL);

    // set up algorithm variables
    a0 = windowWidth * windowHeight * percArea;
    g = area(a0, coefficent);
    circles = [];

    // setup display variables
    rotation = createVector();

    showHelp(5); // show 'help' for 5 sec
}

function draw() {

    // This is the main part of the actual algorith.
    // if we haven't given up on trying to pack in more circles, we're going
    // to try "maxAttempts" to generate a circle that is of the desired area
    // (determined by g(i) func), is within the bounds of the screen, and does
    // not intersect any other circles.
    //
    // if found (ok==true), add the circle to the list of circles and break
    // out of the loop. Otherwise, keep trying.
    if (!gaveUp) {
        let attempts = 0;
        let success = false;

        // try adding a circle
        while (attempts < maxAttempts) {
            let [ok, c] = generateCircle();
            if (ok) {
                circles.push(c);
                success = true;
                break;
            }
            attempts++;
        }
        // if the success variable is not true, that means we've exhausted
        // our maximum number of attempts to pack a circle. Then we want to
        // give up trying to pack more circles. (but keep drawing in draw()).
        if (!success) {
            console.log(`DONE: max attempts (${maxAttempts}) yielded no valid circle.`);
            console.log(`Produced ${circles.length} circles.`);
            // can't use noLoop() or we can't alter the view anymore
            gaveUp = true;
        }
    }

    // clear screen
    background(50);

    // setup view
    if (DO3D) { // things to do if in "3D mode"
        directionalLight(255, 255, 255, -1, 0, -1);
        ambientLight(64);
        // orbitControl(); // sucked so left it out
        if (orthPersp) {
            ortho();
        } else {
            perspective();
        }
    }
    updateRotation();
    rotateX(rotation.x);
    rotateY(rotation.y);
    translate(-width / 2, -height / 2);

    // draw circles
    circles.forEach((c, i) => c.draw(constrain(i, 0, 330)));
}

/**
 * Allows user to toggle "3D mode", perspective, or to reset the rotation.
 */
function keyPressed() {
    if (keyCode === 32) { // spacebar
        DO3D = !DO3D;
    }
    if (keyCode === 80) { // P key
        orthPersp = !orthPersp;
    }
    if (keyCode === 82) { // R key
        rotation.set(0, 0, 0);
    }
}

/**
 * Allows the user to rotate the display along the x and y axes.
 */
function updateRotation() {
    const speed = 0.05;

    if (keyIsDown(UP_ARROW)) {
        rotation.add(speed, 0, 0);
    }
    if (keyIsDown(DOWN_ARROW)) {
        rotation.add(-speed, 0, 0);
    }
    if (keyIsDown(LEFT_ARROW)) {
        rotation.add(0, speed, 0);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        rotation.add(0, -speed, 0);
    }
}

/**
 * Displays a message about the controls for `time` seconds.
 * Kinda have to do it this way because WEBGL in p5 doesn't currently
 * support the text display functions.
 * @param {number} time seconds to display help
 */
function showHelp(time) {
    noLoop();
    let canvas = document.querySelector("canvas");
    canvas.setAttribute("hidden", "true");
    let help = document.createElement("p");
    help.innerText = `Sketch will start in ${time} seconds.\n\nControls:\nUp, Down, Left, Right - rotate objects\nSpace - toggle 2D/3D mode\nR - reset rotation\nP - toggle orthographic or normal perspective`;
    document.querySelector("body").appendChild(help);
    setTimeout(() => {
        help.setAttribute("hidden", "true");
        canvas.removeAttribute("hidden");
        loop();
    }, time * 1000);
}

/**
 * Generates a circle and determines if it's valid.
 * @returns `[bool, Circle]` where bool is true if the Circle is valid.
 */
function generateCircle() {
    let c = new Circle(
        random(width),
        random(height),
        circAtoR(g(circles.length)));

    // check that circle is contained on the screen
    let isContained = c.insideRect(0, 0, width, height);
    // check that circle does not intersect with any of the existing circles.
    // remember that c is NOT in circles[] yet. This simplifies things.
    let noIntersection = circles.every(other => !c.intersects(other));
    return [isContained && noIntersection, c]; // [ok, circle]
}

/**
 * Calculates the radius of a circle having the given area.
 * @param {number} area the area of the circle
 * @returns the radius
 */
function circAtoR(area) {
    return Math.sqrt(area / Math.PI);
}

/**
 * Riemann Zeta function.
 * @param {number} a0 area of g(0), the area of the initial shape
 * @param {number} coefficient power to which i will be raised
 * @returns a function g(i) = a0 / i^coefficient
 */
function area(a0, coefficient) {
    return i => {
        if (i == 0) {
            return a0;
        } else {
            return a0 / Math.pow(i, coefficient);
        }
    }
}


/**
 * Defines a circle.
 */
class Circle {
    /**
     * Makes a circle.
     * @param {number} x x coordinate of location
     * @param {number} y y coordinate of location
     * @param {number} r radius
     */
    constructor(x, y, r) {
        this.pos = createVector(x, y);
        this.r = r;
        this.area = Math.PI * r * r; // not used currently
    }

    /**
     * Draws circle to screen.
     * @param {number} hue hue [0,360]
     */
    draw(hue) {
        push();
        noStroke();
        colorMode(HSB);
        translate(this.pos);
        if (DO3D) { // 3D specific drawing things
            specularMaterial(color(hue, 100, 100));
            sphere(this.r);
        }
        else { // 2d drawing things
            fill(color(hue, 100, 100));
            ellipse(0, 0, 2 * this.r); // draw at (0,0) because used translate()
        }
        pop();
    }

    /**
     * Returns true if this circle intersects with other. False otherwise.
     * @param {Circle} other the other circle
     */
    intersects(other) {
        let d = this.pos.dist(other.pos);
        return d <= this.r + other.r;
    }

    /**
     * Returns true if this circle is completely contained inside of the 
     * rectangle described by the arguments. False otherwise.
     * @param {number} x x coord of rect corner near origin
     * @param {number} y y coord of rect corner near origin
     * @param {number} w width of rect
     * @param {number} h height of rect
     */
    insideRect(x, y, w, h) {
        return (
            this.pos.x - this.r > x &&
            this.pos.x + this.r < x + w &&
            this.pos.y - this.r > y &&
            this.pos.y + this.r < y + h
        )
    }
}