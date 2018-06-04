// Circle/shape packing based on paper written by Paul Bourke.
//
// Title: "Space Filling: A new algorithm for procedural creation of game assets".
// Link: http://www.paulbourke.net/papers/cgat2013/paper.pdf
//
// Written 2018-06 by Ben (https://github.com/quillaja)


// constants and variables use in the algorithm
// i found these constants to produce reasonable results with resonable
// performance in a resonable amount of time.
const default_coefficent = 1.1;
const default_percArea = 0.1;
const default_maxAttempts = 200;
const default_maxCircles = 4000;

let coefficent; // determines how quickly the area shrinks
let percArea; // porportion of total area a0 (0-th circle) will be
let maxAttempts; // times to try inserting a circle before giving up

let a0; // area of 0-th (initial) circle
let g; // function that calculates area of i-th circle
let circles; // list of Circles
let gaveUp = false; // if the area has been fully packed

// variables to control display
let DO3D = false; // "3D mode"
let rotation; // rotation of the objects
let orthPersp = true; // true=ortho; false=perspective

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
            let msg = `DONE: ${maxAttempts} attempts yielded no valid circle. Total circles: ${circles.length}.`;
            showInfo(msg);
            console.log(msg);
            // can't use noLoop() or we can't alter the view anymore
            gaveUp = true;
        }
        // if the parameters for the algorithm are correct, we could produce
        // so many (up to infinity) circles that drawing them etc requires so
        // much processing that performance becomes terrible. Therefore, if we
        // produce over a certain number of circles, we 'give up'.
        if (circles.length >= default_maxCircles) {
            let msg = `DONE: Max of ${default_maxCircles} circles were produced.`;
            showInfo(msg);
            console.log(msg);
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
    if (keyCode === 13) { // Enter key
        // restart the circle packing algorithm.
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
    let msg = "Controls:\n";
    msg += "Enter - Restart the circle packing algorithm.\n";
    msg += "Up, Down - rotate around X-axis.\n";
    msg += "Left, Right - rotate around Y-axis.\n";
    msg += "Space - toggle 2D/3D mode\n";
    msg += "R - reset rotation\n";
    msg += "P - toggle orthographic or normal perspective\n";
    alert(msg);
}

/**
 * Setup the parameters for the algorithm and some of the user interface stuff.
 */
function initialize() {
    // read params from UI
    coefficent = Number(document.getElementById("coefficent").value);
    percArea = Number(document.getElementById("percArea").value);
    maxAttempts = Number(document.getElementById("maxAttempts").value);
    // ensure basic validity
    if (coefficent <= 0) { coefficent = default_coefficent; }
    if (percArea <= 0) { percArea = default_percArea; }
    if (maxAttempts <= 0) { maxAttempts = default_maxAttempts; }

    // setup click events for buttons
    document.getElementById("restart").onclick = () => initialize();
    document.getElementById("setDefaults").onclick = () => setDefaultParams();
    document.getElementById("help").onclick = (ev) => {
        showHelp();
        ev.target.blur(); // if help btn keeps focus, pressing enter or space shows help box =/
    };

    // clear info display
    showInfo("");

    // set globals
    a0 = width * height * percArea;
    g = area(a0, coefficent);
    circles = [];
    gaveUp = false;
}

/**
 * Sets the user-editable parameters to their default values.
 */
function setDefaultParams() {
    document.getElementById("coefficent").value = default_coefficent;
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
