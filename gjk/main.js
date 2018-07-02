import { vec2, vec3, mat2d } from "./gl-matrix-2.4.0/src/gl-matrix.js";
import { EPSILON } from "./gl-matrix-2.4.0/src/gl-matrix/common.js";


/**
 * @typedef {Float32Array} v2
 */

/**
 * @typedef {v2[]} VertArray
 */

/**
 * @type {VertArray}
 */
let shapeAM = [
    new Float32Array([200, 0]),
    new Float32Array([0, 100]),
    new Float32Array([-50, 0]),
    new Float32Array([0, -100]),
];

/**
 * @type {VertArray}
 */
let shapeAW = [
    new Float32Array([200, 0]),
    new Float32Array([0, 100]),
    new Float32Array([-50, 0]),
    new Float32Array([0, -100]),
];

/** */
let shapeATrans = mat2d.create();
let shapeARot = mat2d.create();

/**
 * CIRCLE [center, radius]
 * ELLIPSE [center, width, height]
 */
let shapeB = [vec2.fromValues(50, -100), 100];
// let shapeB = [vec2.fromValues(-50, 100), 50, 150];

// STATE CRAP ////////////////////////////////////////////

class State {
    constructor(dir = undefined) {
        /**@type {v2} */
        this.dir = vec2.fromValues(0, 0);
        if (dir != undefined) {
            vec2.copy(this.dir, dir);
        }
        /**@type {VertArray} */
        this.s = [];

        this.iterations = 0;
        this.intersection = undefined;

        this.extras = undefined;
    }

    copy() {
        let c = new State();
        vec2.copy(c.dir, this.dir);
        c.iterations = this.iterations;
        c.intersection = this.intersection;
        c.extras = this.extras;

        for (const v of this.s) {
            c.s.push(vec2.copy(vec2.create(), v));
        }
        return c;
    }
}

/**@type {State[]}*/
let states = [];

let stateIndex = 0;

/**
 * 
 * @param {v2} startingSearchDir 
 */
function resetStates(startingSearchDir = undefined) {
    let s = new State(vec2.fromValues(1, 1));
    if (startingSearchDir != undefined) {
        vec2.copy(s.dir, startingSearchDir);
    }
    states = [s];
    stateIndex = 0;
    window.states = states;
}

////////////////////////////////////////////////////////////


/**p5 setup() function */
window.setup = function () {
    createCanvas(windowWidth, windowHeight - 10);

    // make n-gon
    // over writes previous definition as a circle
    // shapeB = [];
    // const n = 2;
    // for (let i = 0; i < n; i++) {
    //     let v = p5.Vector.fromAngle(i * TWO_PI / n, 100);
    //     shapeB.push(vec2.fromValues(v.x, v.y));
    // }
    // shapeB = makeEllipse(shapeB[0], shapeB[1], shapeB[0]);

    resetStates();
}


/** p5 draw() function */
window.draw = function () {
    background(50);

    translate(width / 2, height / 2);
    // scale(1, -1);

    // axes
    stroke('blue');
    line(0, 0, 10, 0);
    stroke('yellow');
    line(0, 0, 0, 10);
    stroke(255);



    // draw //////
    noFill();

    //triangle
    beginShape();
    for (let i = 0; i < shapeAW.length; i++) {
        vertex(shapeAW[i][0], shapeAW[i][1]);
    }
    endShape(CLOSE);

    //circle (or whatever)
    // ellipse(shapeB[0][0], shapeB[0][1], 2 * shapeB[1], 2 * shapeB[2]); // draw ellipse
    ellipse(shapeB[0][0], shapeB[0][1], 2 * shapeB[1]); // draw circle
    // beginShape();
    // for (let i = 0; i < shapeB.length; i++) {
    //     vertex(shapeB[i][0], shapeB[i][1]);
    // }
    // endShape(CLOSE);

    // find farthest point from origin towards mouse.
    let m = vec2.fromValues(mouseX - width / 2, mouseY - height / 2);
    let f = farthestP(shapeAW, m);
    ellipse(f[0], f[1], 5);

    // f = farthestP(shapeB, m);
    f = farthestC(shapeB[0], shapeB[1], m);
    // f = farthestE(shapeB[0], shapeB[1], shapeB[2], m);
    ellipse(f[0], f[1], 5);

    // draw GJK states
    fill(255);
    if (states[stateIndex] != null) {
        let s = states[stateIndex];

        push();
        stroke(64);
        noFill();
        beginShape();
        for (let i = 0; i < s.s.length; i++) {
            vertex(s.s[i][0], s.s[i][1]);
        }
        endShape(CLOSE);
        pop();

        stroke('red');
        if (s.intersection) {
            stroke('green');
        }
        drawPoints(s.s);
        line(0, 0, s.dir[0] * 50, s.dir[1] * 50);

        if (s.extras != undefined && keyIsDown(86)) { //86=v
            push();
            stroke('pink');
            line(0, 0, s.extras.normalAB[0] * 25, s.extras.normalAB[1] * 25);
            strokeWeight(2);
            line(0, 0, s.extras.ab[0], s.extras.ab[1]);
            stroke('cyan');
            line(0, 0, s.extras.normalAC[0] * 25, s.extras.normalAC[1] * 25);
            strokeWeight(2);
            line(0, 0, s.extras.ac[0], s.extras.ac[1]);
            strokeWeight(1);
            stroke('magenta');
            line(0, 0, s.extras.ao[0], s.extras.ao[1]);
            pop();
        }

        text("stateIndex: " + stateIndex, 5 - width / 2, 16 - height / 2);
        text("simplex size: " + s.s.length, 5 - width / 2, 32 - height / 2);
    }
    noFill();

    // gjk "support point" in direction of mouse
    f = support(shapeAW, shapeB, m);
    stroke('orange');
    ellipse(f[0], f[1], 5);

    // mouse vector
    stroke(96);
    line(0, 0, m[0], m[1]);
}

/** p5 keyPressed() function */
window.keyPressed = function () {
    const speed = 10;
    const rot = PI / 16;
    let shapeAChanged = false;
    if (keyCode == UP_ARROW) {
        mat2d.translate(shapeATrans, shapeATrans, [0, -speed]);
        shapeAChanged = true;
    }
    if (keyCode == DOWN_ARROW) {
        mat2d.translate(shapeATrans, shapeATrans, [0, speed]);
        shapeAChanged = true;
    }
    if (keyCode == LEFT_ARROW) {
        if (keyIsDown(SHIFT)) {
            mat2d.rotate(shapeARot, shapeARot, -rot);
        } else {
            mat2d.translate(shapeATrans, shapeATrans, [-speed, 0]);
        }
        shapeAChanged = true;
    }
    if (keyCode == RIGHT_ARROW) {
        if (keyIsDown(SHIFT)) {
            mat2d.rotate(shapeARot, shapeARot, rot);
        } else {
            mat2d.translate(shapeATrans, shapeATrans, [speed, 0]);
        }
        shapeAChanged = true;
    }

    if (shapeAChanged) {
        // rotate then translate each point
        for (let i = 0; i < shapeAM.length; i++) {
            vec2.transformMat2d(shapeAW[i], shapeAM[i], shapeARot);
            vec2.transformMat2d(shapeAW[i], shapeAW[i], shapeATrans);
        }

        resetStates();
    }

    // state controls

    if (keyCode == 32) { //space
        let nextState = gjkStateMachine(shapeAW, shapeB, states[states.length - 1].copy());
        if (nextState.intersection == true) {
            console.log("INTERSECTION");
        }
        if (nextState.intersection == false) {
            console.log("NO INTERSECTION POSSIBLE");
        }
        states.push(nextState);
        stateIndex = states.length - 1;
    }

    if (keyCode == 190) { // > (period)
        stateIndex++;
        if (stateIndex >= states.length) {
            stateIndex = 0;
        }
    }

    if (keyCode == 188) { // < (comma)
        stateIndex--;
        if (stateIndex < 0) {
            stateIndex = states.length - 1;
        }
    }
}

const labels = ["C", "B", "A"];
/**
 * draws and labels points in "s"
 * @param {v2[]} s 
 * @param {number} times 
 */
function drawPoints(s, times = 0) {
    let nstr = "";
    if (times != 0) {
        nstr = times.toString() + "|";
    }
    let loff = 3 - s.length;
    for (let i = 0; i < s.length; i++) {
        ellipse(s[i][0], s[i][1], 5);

        // crappy way to make text appear correct
        push();
        translate(s[i][0], s[i][1])
        // scale(1, -1);
        text(labels[i + loff] + nstr, times * 18, 0);
        pop();
    }
}

function makeEllipse(center, width, height, detail = 24) {
    let verts = [];
    for (let i = 0; i < detail; i++) {
        let theta = i / detail * Math.PI * 2;
        verts.push(vec2.fromValues(
            center[0] + width * Math.cos(theta),
            center[1] + height * Math.sin(theta))); // WAY better
    }
    return verts;
}


//// "SUPPORT" FUNCTIONS ////////////////////////////////////////

/**
 * returns farthest vertext in given direction
 * @param {VertArray} verts verticies
 * @param {v2} dir direction
 * @returns {v2}
 */
function farthestP(verts, dir) {
    let maxdp = -Infinity;
    let rval = vec2.create();
    for (const v of verts) {
        let dp = vec2.dot(dir, v);
        if (dp > maxdp) {
            maxdp = dp;
            vec2.copy(rval, v); // have to copy
        }
    }

    return rval;
}

/**
 * farthest point on a circle's edge in the given direction
 * @param {v2} center 
 * @param {number} radius 
 * @param {v2} dir 
 * @returns {v2}
 */
function farthestC(center, radius, dir) {
    let rval = vec2.fromValues(dir[0], dir[1]);
    vec2.normalize(rval, rval);
    vec2.scaleAndAdd(rval, center, rval, radius);
    return rval;
}

/**
 * 
 * @param {v2} center 
 * @param {number} width 
 * @param {number} height 
 * @param {v2} dir 
 */
function farthestE(center, width, height, dir) {
    // let theta = Math.atan2(dir[1], dir[0]);
    // return vec2.fromValues(width * Math.cos(theta) + center[0], height * Math.sin(theta) + center[1]);

    // /\ above and \/ below produce the same results (i think)

    // let x = dir[0] / vec2.length(dir) * major;
    // let y = Math.abs((minor / major) * Math.sqrt((major * major) - (x * x)));
    // if (dir[1] >= 0) {
    //     return vec2.fromValues(x + center[0], y + center[1]);
    // } else {
    //     return vec2.fromValues(x + center[0], -y + center[1]);
    // }

    // this produces the point on the ellipse edge where dir intersects, but
    // that is NOT the farthest point in dir.
    // let theta = Math.atan2(dir[1], dir[0]);
    // let r = (major * minor) / (Math.sqrt(Math.pow(minor * Math.cos(theta), 2) + Math.pow(major * Math.sin(theta), 2)));
    // let rval = vec2.normalize(vec2.create(), dir);
    // vec2.scale(rval, rval, r);
    // return rval;

    // THIS seems to work right!
    // find point where the perpendicular of dir is tangent to the ellipse.
    let m = -dir[0] / dir[1]; // slope of perpendicular to dir
    let asq = width * width;
    let bsq = height * height;
    let denom = Math.sqrt(m * m * asq + bsq);
    let x = (-m * asq) / denom;
    let y = bsq / denom;
    if (dir[1] < 0) {
        x = -x;
        y = -y;
    }
    return vec2.fromValues(x + center[0], y + center[1]);
}

/**
 * figures out what a and b are and uses appropriate support functions to
 * return the "support" point of "A-B" (minkowski difference).
 * @param {VertArray|Array} a 
 * @param {VertArray|Array} b 
 * @param {v2} dir
 * @return {v2}
 */
function support(a, b, dir) {
    let farA = null;
    let farB = null;
    //ASSUME a and b have at least 2 elements
    if (typeof a[1] == "number") {
        if (typeof a[2] == "number") {
            // ellipse
            farA = farthestE(a[0], a[1], a[2], dir);
        } else {
            // a is a circle
            farA = farthestC(a[0], a[1], dir);
        }
    } else {
        // a is polygon
        farA = farthestP(a, dir);
    }

    // have to search b in the opposite direction (-dir)
    vec2.scale(dir, dir, -1);
    if (typeof b[1] == "number") {
        if (typeof b[2] == "number") {
            farB = farthestE(b[0], b[1], b[2], dir);
        } else {
            // b is a circle
            farB = farthestC(b[0], b[1], dir);
        }
    } else {
        //b is polygon
        farB = farthestP(b, dir);
    }

    // change dir back to original direction
    vec2.scale(dir, dir, -1);

    return vec2.sub(farA, farA, farB);
}




/**
 * does GJK algorithim in 2D ONLY. Takes incoming "state" and returns a new
 * state representing the results of the iteration.
 * @param {VertArray|Array} shapeA
 * @param {VertArray|Array} shapeB
 * @param {State} state 
 * @returns {State}
 */
function gjkStateMachine(shapeA, shapeB, state) {
    if (state == null || state == undefined) {
        throw Error("'state' cannot be null,etc");
    }
    state.iterations + 1;

    switch (state.s.length) {
        case 0: // initialize
            {
                if (state.dir == null || state.dir == undefined ||
                    vec2.equals(state.dir, origin)) {
                    vec2.set(state.dir, 1, 1); // "random" direction to start
                }

                let a = support(shapeA, shapeB, state.dir);
                state.s.push(a);

                // evaluate new point
                if (approxEqual(a, origin)) { // a is ON the origin. don't need to continue
                    state.intersection = true;
                    return state;
                }

                setNextSearchDirectionFromPoint(state.s, state.dir)

                return state;
            }

        case 1: // incoming simplex is point
            {
                let a = support(shapeA, shapeB, state.dir);

                state.s.push(a); // new simplex is a line

                // evaluate new point
                if (approxEqual(a, origin)) { // a is ON the origin
                    state.intersection = true;
                    return state;
                }

                let adotdir = vec2.dot(a, state.dir);
                if (adotdir <= -EPSILON) { // a did not reach origin. don't need to continue
                    state.intersection = false;
                    return state;
                }

                let b = state.s[0];
                let ab = vec2.fromValues(b[0] - a[0], b[1] - a[1]);
                if (Math.abs((ab[0] * -a[1]) - (ab[1] * -a[0])) <= EPSILON) { // find more 'elegant' method?
                    // if ABxAO is 0 then
                    // origin is ON the line AB
                    state.intersection = true;
                    return state;
                }

                // set next search direction
                setNextSearchDirectionFromLine(state.s, state.dir);

                return state;
            }

        case 2: // incoming simplex is line
            {
                // get new point
                let a = support(shapeA, shapeB, state.dir);

                state.s.push(a); // new simplex is triangle

                // evaluate new point
                if (approxEqual(a, origin)) { // a is ON the origin
                    state.intersection = true;
                    return state;
                }
                let adotdir = vec2.dot(a, state.dir);
                if (adotdir <= -EPSILON) { // a did not reach origin
                    state.intersection = false;
                    return state;
                }

                // let normalAB = getNormalInDirectionOfPoint(a, state.s[1], origin);
                // let normalAC = getNormalInDirectionOfPoint(a, state.s[0], origin);
                let ao = vec2.fromValues(-a[0], -a[1]);
                let ab = vec2.fromValues(state.s[1][0] - a[0], state.s[1][1] - a[1]);
                let ac = vec2.fromValues(state.s[0][0] - a[0], state.s[0][1] - a[1]);
                let normalAB = triangleNormals(ab, ac);
                let normalAC = triangleNormals(ac, ab);
                let abDOTao = vec2.dot(ab, ao);
                let acDOTao = vec2.dot(ac, ao);

                state.extras = {
                    normalAB: normalAB,
                    normalAC: normalAC,
                    ab: ab,
                    ac: ac,
                    ao: ao,
                    abDOTao: abDOTao,
                    acDOTao: acDOTao,
                }

                if (Math.abs(ab[0] * ao[1] - ab[1] * ao[0]) <= EPSILON ||
                    Math.abs(ac[0] * ao[1] - ac[1] * ao[0]) <= EPSILON) { // find more 'elegant' method?
                    // if ABxAO or ACxAO is 0 then
                    // origin is ON one of the lines AB or AC
                    state.intersection = true;
                    return state;
                }

                if (abDOTao < -EPSILON && acDOTao < -EPSILON) {
                    // origin is past A.
                    // new simplex is A, new search direction is AO
                    state.s.splice(0, 2); // should remove elements 0 and 1 (C and B)
                    vec2.copy(state.dir, ao);
                    return state;
                }

                if (sameDirection(normalAB, ao)) {
                    // AB's normal is in the same direction as AO,
                    // so origin is in the AB region
                    // new simplex is AB,
                    // new search direction is normalAB
                    state.s.splice(0, 1); // should remove element 0 (C)
                    vec2.copy(state.dir, normalAB);
                    return state;
                }

                if (sameDirection(normalAC, ao)) {
                    // AC's normal is in the same direction as AO,
                    // so origin is in the AC region
                    // new simplex is AC
                    // new search direction is normalAC
                    state.s.splice(1, 1); // should remove element 1 (B)
                    vec2.copy(state.dir, normalAC);
                    return state;
                }

                // origin is in triangle simplex
                state.intersection = true;
                return state;

            }
        case 3: // incoming simplex is triangle
        // skip... for 3D
    }

    console.log("YOU SHOULDN'T BE HERE, JIMLA!");
    return null; // JIM LAW
}

function gjkBool(shapeA, shapeB, dir = undefined, maxIterations = 8) {
    let state = new State(dir);
    while (state.intersection == undefined && state.iterations <= maxIterations) {
        gjkStateMachine(shapeA, shapeB, state);
    }
    return state.intersection; // what about failure by max iterations?
}

//// GJK HELPER FUNCS ////////////////////////////////////////////////////

/**@type {v2} */
const origin = vec2.create();

function setNextSearchDirectionFromPoint(simplex, nextDir) {
    vec2.subtract(nextDir, origin, simplex[0]); // equivalent to below
    vec2.normalize(nextDir, nextDir);
    // vec2.scale(nextState.dir, state.dir, -1); // set next search direction
}

function setNextSearchDirectionFromLine(simplex, nextDir) {
    vec2.copy(nextDir, getNormalInDirectionOfPoint(simplex[1], simplex[0], origin));
}

function setNextSearchDirectionFromTriangle() {

}

/**
 * not the same as vec2.equals()
 * @param {v2} a 
 * @param {v2} b 
 */
function approxEqual(a, b) {
    return Math.abs(a[0] - b[0]) <= EPSILON && Math.abs(a[1] - b[1]) <= EPSILON;
}

/**
 * 
 * @param {v2} a 
 * @param {v2} b 
 */
function sameDirection(a, b) {
    return vec2.dot(a, b) >= EPSILON;
}

/**
 * 
 * @param {v2} a 
 * @param {v2} b 
 * @returns {number} the Z portion of the cross product
 */
function cross2d(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

/**
 * not most efficient. normal may be zero if point is co-linear with from-to
 * @param {v2} from 
 * @param {v2} to 
 * @param {v2} point
 * @returns {v2}
 */
function getNormalInDirectionOfPoint(from, to, point) {
    const posZ = vec3.fromValues(0, 0, 1);
    let ab = vec3.fromValues(from[0] - to[0], from[1] - to[1], 0);
    let ao = vec3.fromValues(point[0] - from[0], point[1] - from[1], 0);
    let normal = vec3.create();
    vec3.cross(normal, ab, posZ); //AB x +Z will always produce "CCW" values
    vec3.scale(normal, normal, vec3.dot(normal, ao)); // will correct 'sign' of previous cross product
    vec3.normalize(normal, normal);
    return vec2.fromValues(normal[0], normal[1]);
}
window.getNormalInDirectionOfPoint = getNormalInDirectionOfPoint;

/**@returns {v2} */
function triangleNormals(AB, AC) {
    let ab = vec3.fromValues(AB[0], AB[1], 0);
    let ac = vec3.fromValues(AC[0], AC[1], 0);
    let rval = vec3.create();
    vec3.cross(rval, ab, ac);
    vec3.cross(rval, ab, rval);
    vec3.normalize(rval, rval);
    return vec2.fromValues(rval[0], rval[1]);
}
window.triangleNormals = triangleNormals;

////// FIRST ATTEMPT //////////////////////////////////////////////
// /**
//  * 
//  * @param {VertArray|Array} a 
//  * @param {VertArray|Array} b 
//  * @param {v2} startDir
//  */
// function gjk(a, b, startDir = undefined) {

//     let dir = vec2.fromValues(15, 15); // D, "random" direction
//     // if (startDir != undefined) {
//     //     vec2.copy(dir, startDir); // need to copy dir because we'll modify it a lot
//     // }
//     line(0, 0, dir[0], dir[1]);

//     let s = [support(a, b, dir)]; // S
//     vec2.scale(dir, s[0], -1); // D = -S (don't see need to normalize)
//     s.push(support(a, b, dir));

//     // if (vec2.dot(s[s.length - 1], dir) >= 0) { stroke('green'); }
//     // else { stroke('red'); }
//     // line(0, 0, dir[0], dir[1]);
//     // drawPoints(s);

//     let simplexSize = 2;

//     let times = 0;
//     while (times < 4 && simplexSize > 1 && vec2.dot(s[s.length - 1], dir) >= 0) {
//         // if (vec2.dot(s[s.length - 1], dir) < 0) { console.log("terminate. origin unreachable"); }
//         console.log("run: " + times + "--------------");

//         simplexSize = doSimplex(s, dir, simplexSize);
//         s.push(support(a, b, dir));
//         console.log(s);

//         // if (vec2.dot(s[s.length - 1], dir) >= 0) { stroke('green'); }
//         // else { stroke('red'); }
//         // line(0, 0, dir[0], dir[1]);
//         stroke('green');
//         drawPoints(s, times);
//         times++;

//         if (simplexSize == 0) {
//             console.log("Found and exit. simplexSize==0");
//             return true;
//         }
//     }

//     console.log("exited GJK. not found");
//     return false;
// }

// /**
//  * FUNCTION WILL ALTER "s" and "dir"
//  * @param {v2[]} s 
//  * @param {v2} dir 
//  * @param {number} simplexSize 
//  * @returns {number} new simplex size????
//  */
// function doSimplex(s, dir, simplexSize) {

//     let a = s[s.length - 1];
//     let ao = vec3.create();
//     vec2.subtract(ao, ao, a);
//     stroke('magenta');
//     line(a[0], a[1], ao[0], ao[1]);

//     if (simplexSize == 2) {
//         let b = s[s.length - 2];
//         let ab = vec3.create();
//         vec2.sub(ab, b, a); // seg A->B
//         let dp = vec2.dot(ao, ab);
//         switch (true) {
//             case abs(dp) < 0.01:
//                 console.log("size2: dp==0");
//                 return 0;
//             case dp < 0:
//                 console.log("size2: dp<0");
//                 // origin is beyond the A->B region
//                 vec2.copy(dir, ao);
//                 // s = [a];
//                 s.length = 0;
//                 s.push(a);
//                 return 2; // new line, A-> new support
//             default: // dp > 0
//                 console.log("size2: default");
//                 // origin is in A->B region
//                 // let ab3 = vec3.fromValues(ab[0], ab[1], 0);
//                 vec3.cross(ao, ab, ao);
//                 vec3.cross(ao, ao, ab); // ABxAOxAB
//                 vec3.normalize(ao, ao);
//                 vec3.scale(ao, ao, 20); // for show only
//                 vec2.copy(dir, ao); // back to 2d vector
//                 // s = [b, a];
//                 s.length = 0;
//                 s.push(b);
//                 s.push(a);
//                 return 3;
//         }
//     }

//     if (simplexSize == 3) {
//         let b = s[s.length - 2];
//         let c = s[s.length - 3];
//         let ab = vec3.create();
//         let ac = vec3.create();
//         vec2.subtract(ab, b, a); // seg A->B
//         vec2.subtract(ac, c, a); // seg A->C
//         // console.log("a", a, "b", b, "c", c);
//         // console.log("ao", ao);
//         // console.log("ab", ab);
//         // console.log("ac", ac);
//         let abxao = vec3.cross(vec3.create(), ab, ao);
//         let acxao = vec3.cross(vec3.create(), ac, ao);
//         // console.log(abxao,acxao);
//         switch (true) {
//             case abxao[2] * acxao[2] <= 0.01: // cross products are going opposite directions, so AO is between them
//                 vec2.set(dir, ao[0], ao[1]);
//                 console.log("size3: inside simplex");
//                 return 0; //found
//             case vec2.dot(ao, ab) < 0 && vec2.dot(ao, ac) < 0: // beyond a
//                 vec2.copy(dir, ao);
//                 console.log("size3: past a");
//                 // s = [a];
//                 s.length = 0;
//                 s.push(a);
//                 return 2;
//             default:
//                 console.log("size3: default");
//                 // calc normals for both AB and AC and dot each with AO.
//                 vec3.cross(abxao, ab, abxao);//, ab); // backwards? because of winding direction??
//                 stroke('pink');
//                 line(a[0], a[1], b[0], b[1]);//AB
//                 line(a[0], a[1], abxao[0], abxao[1]);//normal
//                 // console.log("abxaoxab", abxao);
//                 if (vec2.dot(ao, abxao) >= 0.01) {
//                     console.log("side of ab", vec2.dot(ao, abxao).toFixed(3));
//                     if (abs(vec2.dot(ao, abxao)) <= 0.01) { console.log("on ab"); }
//                     vec3.normalize(abxao, abxao);
//                     vec3.scale(abxao, abxao, 30);
//                     vec2.copy(dir, abxao);
//                     // s = [b, a];
//                     s.length = 0;
//                     s.push(b);
//                     s.push(a);
//                     return 3;
//                 }
//                 vec3.cross(acxao, acxao, ac);
//                 stroke('cyan');
//                 line(a[0], a[1], c[0], c[1]);//AC
//                 line(a[0], a[1], acxao[0], acxao[1]); //normal
//                 // console.log("acxaoxac", acxao);
//                 if (vec2.dot(ao, acxao) >= 0.01) {
//                     console.log("side of ac", vec2.dot(ao, acxao).toFixed(3));
//                     if (vec2.dot(ao, acxao) <= 0.01) { console.log("on ac"); }
//                     vec3.normalize(acxao, acxao);
//                     vec3.scale(acxao, acxao, 30);
//                     vec2.copy(dir, acxao);
//                     //swap c and b
//                     // console.log("before swap", s);
//                     // s[s.length - 2] = c;
//                     // s[s.length - 3] = b;
//                     // console.log("after swap", s);
//                     // s = [c, a];
//                     s.length = 0;
//                     s.push(c);
//                     s.push(a);
//                     return 3;
//                 }
//         }
//     }
//
//     console.log("simplex size -1??");
//     return -1;
// }
