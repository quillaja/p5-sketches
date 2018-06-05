// Circle/shape packing based on paper written by Paul Bourke.
//
// Title: "Space Filling: A new algorithm for procedural creation of game assets".
// Link: http://www.paulbourke.net/papers/cgat2013/paper.pdf
//
// Written 2018-06 by Ben (https://github.com/quillaja)


// constants and variables use in the algorithm
// i found these constants to produce reasonable results with resonable
// performance in a resonable amount of time.
const default_coefficient = 1.1;
const default_percArea = 0.1;
const default_maxAttempts = 500;
const default_maxShapes = 4000;

let coefficient; // determines how quickly the area shrinks
let percArea; // porportion of total area a0 (0-th shape) will be
let maxAttempts; // times to try inserting a shape before giving up

let boundingShape; // shape to fill
let g; // function that calculates area of i-th shape
let shapes; // list of shapes
let gaveUp = false; // if the area has been fully packed
let packingType; // type of shape to pack

// variables to control display
let DO3D = false; // "3D mode"
let rotation; // rotation of the objects
let orthPersp = true; // true=ortho; false=perspective
let drawBound = false;

/**
 * Basic p5.js setup()
 */
function setup() {
    createCanvas(windowWidth, windowHeight - 40, WEBGL);

    // set up algorithm variables
    initialize();

    // setup display variables
    rotation = createVector();
}

/**
 * Basic p5.js draw()
 */
function draw() {

    // try packing a shape!
    pack();

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

    if (drawBound) {
        boundingShape.draw(color(255));
    }

    // draw shapes
    colorMode(HSB);
    shapes.forEach((c, i) => c.draw(color(constrain(i, 0, 330), 100, 100), DO3D));
    colorMode(RGB);
}

/**
 * Allows user to toggle "3D mode", perspective, drawing the bounding shape,
 * or to reset the rotation.
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
    if (keyCode === 66) { // B key
        drawBound = !drawBound;
    }
    if (keyCode === 13) { // Enter key
        // restart the shape packing algorithm.
        initialize();
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
    if (keyIsDown(RIGHT_ARROW)) {
        rotation.add(0, speed, 0);
    }
    if (keyIsDown(LEFT_ARROW)) {
        rotation.add(0, -speed, 0);
    }
}

/**
 * Displays a message about the controls in a message box.
 * Kinda have to do it this way because WEBGL in p5 doesn't currently
 * support the text display functions.
 */
function showHelp() {
    let helpbox = document.getElementById("helpbox");
    helpbox.hidden = false;
    document.getElementById("helpboxExit").onclick = () => helpbox.hidden = true;
}

/**
 * Setup the parameters for the algorithm and some of the user interface stuff.
 */
function initialize() {
    // read params from UI
    coefficient = Number(document.getElementById("coefficient").value);
    percArea = Number(document.getElementById("percArea").value);
    maxAttempts = Number(document.getElementById("maxAttempts").value);
    // ensure basic validity
    if (coefficient <= 0) { coefficient = default_coefficient; }
    if (percArea <= 0) { percArea = default_percArea; }
    if (maxAttempts <= 0) { maxAttempts = default_maxAttempts; }

    // setup click events for buttons
    // if btn keeps focus pressing enter/space activates btn, which makes odd behavior
    document.getElementById("restart").onclick = (ev) => { initialize(); ev.target.blur(); };
    document.getElementById("setDefaults").onclick = (ev) => { setDefaultParams(); ev.target.blur(); };
    document.getElementById("help").onclick = (ev) => { showHelp(); ev.target.blur(); };

    // clear info display
    showInfo("");

    // set globals
    // a0 = width * height * percArea;
    if (random() < 0.5) {
        boundingShape = new Circle(
            createVector(width / 2, height / 2),
            Math.PI * Math.pow(height / 2 - 50, 2)
        );
    } else {
        boundingShape = new AARect(
            createVector(width / 2, height / 2), 1,
            height * (height - 50));
    }

    if (random() < 0.5) {
        packingType = Circle;
    } else {
        packingType = AARect;
    }

    g = sequence(coefficient);
    shapes = [];
    gaveUp = false;
}

/**
 * Sets the user-editable parameters to their default values.
 */
function setDefaultParams() {
    document.getElementById("coefficient").value = default_coefficient;
    document.getElementById("percArea").value = default_percArea;
    document.getElementById("maxAttempts").value = default_maxAttempts;
}

/**
 * Sets the text content of the "info" display element.
 * @param {string} str the message to display
 */
function showInfo(str) {
    let info = document.getElementById("info");
    info.innerText = str;
}
