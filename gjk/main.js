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
let triM = [
    new Float32Array([200, 0]),
    new Float32Array([0, 100]),
    // new Float32Array([-50, 0]),
    new Float32Array([0, -100]),
];

/**
 * @type {VertArray}
 */
let triW = [
    new Float32Array([200, 0]),
    new Float32Array([0, 100]),
    // new Float32Array([-50, 0]),
    new Float32Array([0, -100]),
];

/** */
let triTrans = mat2d.create();
let triRot = mat2d.create();

/**
 * CIRCLE [center, radius]
 */
let circ = [vec2.fromValues(0, 0), 100];

window.setup = function () {
    createCanvas(windowWidth, windowHeight - 10);
    // v = vec2.fromValues(50, 50);
    // frameRate(5);

    circ = [];
    for (let i = 0; i < 16; i++) {
        let v = p5.Vector.fromAngle(i * TWO_PI / 16, 100);
        circ.push(vec2.fromValues(v.x, v.y));
    }
}

// STATE CRAP ////////////////////////////////////////////
/**@type {State[]}*/
let states = [];

let stateIndex = 0;

window.states = states;
////////////////////////////////////////////////////////////


window.draw = function () {
    background(50);

    translate(width / 2, height / 2);
    // scale(1, -1);
    stroke('blue');
    line(0, 0, 10, 0);
    stroke('yellow');
    line(0, 0, 0, 10);
    stroke(255);



    // draw
    noFill();
    beginShape();
    //triangle
    for (let i = 0; i < triW.length; i++) {
        vertex(triW[i][0], triW[i][1]);
    }
    endShape(CLOSE);

    //circle
    beginShape();
    for (let i = 0; i < circ.length; i++) {
        vertex(circ[i][0], circ[i][1]);
    }
    endShape(CLOSE);

    // find farthest point from origin towards mouse.
    let m = vec2.fromValues(mouseX - width / 2, mouseY - height / 2);
    let f = farthestP(triW, m);
    ellipse(f[0], f[1], 5);

    // ellipse(0, 0, 2 * circ[1]); // draw circle
    // f = farthestC(circ[0], circ[1], m);
    f = farthestP(circ, m);
    ellipse(f[0], f[1], 5);

    // gjk(triW, circ);
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

        if (s.intersection) {
            stroke('green');
        } else {
            stroke('red');
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
    f = support(triW, circ, m);
    stroke('orange');
    ellipse(f[0], f[1], 5);

    // mouse vector
    stroke(96);
    line(0, 0, m[0], m[1]);
}

window.keyPressed = function () {
    const speed = 10;
    const rot = PI / 16;
    let triChanged = false;
    if (keyCode == UP_ARROW) {
        mat2d.translate(triTrans, triTrans, [0, -speed]);
        triChanged = true;
    }
    if (keyCode == DOWN_ARROW) {
        mat2d.translate(triTrans, triTrans, [0, speed]);
        triChanged = true;
    }
    if (keyCode == LEFT_ARROW) {
        if (keyIsDown(SHIFT)) {
            mat2d.rotate(triRot, triRot, -rot);
        } else {
            mat2d.translate(triTrans, triTrans, [-speed, 0]);
        }
        triChanged = true;
    }
    if (keyCode == RIGHT_ARROW) {
        if (keyIsDown(SHIFT)) {
            mat2d.rotate(triRot, triRot, rot);
        } else {
            mat2d.translate(triTrans, triTrans, [speed, 0]);
        }
        triChanged = true;
    }

    if (triChanged) {
        // rotate then translate each point
        for (let i = 0; i < triM.length; i++) {
            vec2.transformMat2d(triW[i], triM[i], triRot);
            vec2.transformMat2d(triW[i], triW[i], triTrans);
        }
    }

    // state controls

    if (keyCode == 32) { //space
        let nextState = gjk2(triW, circ, states[states.length - 1]);
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
        // a is a circle
        farA = farthestC(a[0], a[1], dir);
    } else {
        // a is polygon
        farA = farthestP(a, dir);
    }

    // have to search b in the opposite direction (-dir)
    vec2.scale(dir, dir, -1);
    if (typeof b[1] == "number") {
        // b is a circle
        farB = farthestC(b[0], b[1], dir);
    } else {
        //b is polygon
        farB = farthestP(b, dir);
    }

    // change dir back to original direction
    vec2.scale(dir, dir, -1);

    return vec2.sub(farA, farA, farB);
}

class State {
    constructor() {
        /**@type {v2} */
        this.dir = vec2.fromValues(0, 0);
        /**@type {VertArray} */
        this.s = [];

        this.iterations = 0;
        this.intersection = undefined;
        // this.AdotDirWasLTZero = false;

        this.extras = undefined;
    }
}

/**@type {v2} */
const origin = vec2.create();

/**
 * @param {VertArray|Array} shapeA
 * @param {VertArray|Array} shapeB
 * @param {State} state 
 * @returns {State}
 */
function gjk2(shapeA, shapeB, state) {
    let nextState = new State();
    if (state == null || state == undefined) {
        state = new State();
    }
    nextState.iterations = state.iterations + 1;

    switch (state.s.length) {
        case 0: // initialize
            {
                vec2.set(state.dir, 1, 1); // "random" direction to start
                let a = support(shapeA, shapeB, state.dir);

                // evaluate new point
                if (vec2.equals(a, origin)) { // a is ON the origin. don't need to continue
                    nextState.intersection = true;
                    return nextState;
                }

                nextState.s.push(a);
                setNextSearchDirectionFromPoint(nextState.s, nextState.dir)

                return nextState;
            }

        case 1: // incoming simplex is point
            {
                let a = support(shapeA, shapeB, state.dir);

                nextState.s.push(...state.s); // copy previous simplex to next state
                nextState.s.push(a); // new simplex is a line

                // evaluate new point
                if (vec2.equals(a, origin)) { // a is ON the origin
                    nextState.intersection = true;
                    return nextState;
                }
                let adotdir = vec2.dot(a, state.dir);
                if (adotdir < 0) { // a did not reach origin. don't need to continue
                    nextState.intersection = false;
                    return nextState;
                }

                // set next search direction
                setNextSearchDirectionFromLine(nextState.s, nextState.dir);

                return nextState;
            }

        case 2: // incoming simplex is line
            {
                // get new point
                let a = support(shapeA, shapeB, state.dir);

                nextState.s.push(...state.s); // copy previous simplex to next state
                nextState.s.push(a); // new simplex is triangle

                let adotdir = vec2.dot(a, state.dir);
                if (adotdir < 0) { // a did not reach origin
                    nextState.intersection = false;
                    return nextState;
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

                nextState.extras = {
                    normalAB: normalAB,
                    normalAC: normalAC,
                    ab: ab,
                    ac: ac,
                    ao: ao,
                    abDOTao: abDOTao,
                    acDOTao: acDOTao,
                }

                if (abDOTao < 0 && acDOTao < 0) {
                    // origin is past A.
                    // new simplex is A, new search direction is AO
                    nextState.s.splice(0, 2); // should remove elements 0 and 1 (C and B)
                    vec2.copy(nextState.dir, ao);
                    return nextState;
                }

                if (sameDirection(normalAB, ao)) {
                    // AB's normal is in the same direction as AO,
                    // so origin is in the AB region
                    // new simplex is AB,
                    // new search direction is normalAB
                    nextState.s.splice(0, 1); // should remove element 0 (C)
                    vec2.copy(nextState.dir, normalAB);
                    return nextState;
                }

                if (sameDirection(normalAC, ao)) {
                    // AC's normal is in the same direction as AO,
                    // so origin is in the AC region
                    // new simplex is AC
                    // new search direction is normalAC
                    nextState.s.splice(1, 1); // should remove element 1 (B)
                    vec2.copy(nextState.dir, normalAC);
                    return nextState;
                }

                // origin is in triangle simplex
                nextState.intersection = true;
                return nextState;

            }
        case 3: // incoming simplex is triangle
        // skip... for 3D
    }

    console.log("SHOULDN'T HAVE GOT HERE");
    return state; // return copy of current state
}

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
 * 
 * @param {v2} a 
 * @param {v2} b 
 */
function sameDirection(a, b) {
    return vec2.dot(a, b) >= 0;
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

/**
 * 
 * @param {VertArray|Array} a 
 * @param {VertArray|Array} b 
 * @param {v2} startDir
 */
function gjk(a, b, startDir = undefined) {

    let dir = vec2.fromValues(15, 15); // D, "random" direction
    // if (startDir != undefined) {
    //     vec2.copy(dir, startDir); // need to copy dir because we'll modify it a lot
    // }
    line(0, 0, dir[0], dir[1]);

    let s = [support(a, b, dir)]; // S
    vec2.scale(dir, s[0], -1); // D = -S (don't see need to normalize)
    s.push(support(a, b, dir));

    // if (vec2.dot(s[s.length - 1], dir) >= 0) { stroke('green'); }
    // else { stroke('red'); }
    // line(0, 0, dir[0], dir[1]);
    // drawPoints(s);

    let simplexSize = 2;

    let times = 0;
    while (times < 4 && simplexSize > 1 && vec2.dot(s[s.length - 1], dir) >= 0) {
        // if (vec2.dot(s[s.length - 1], dir) < 0) { console.log("terminate. origin unreachable"); }
        console.log("run: " + times + "--------------");

        simplexSize = doSimplex(s, dir, simplexSize);
        s.push(support(a, b, dir));
        console.log(s);

        // if (vec2.dot(s[s.length - 1], dir) >= 0) { stroke('green'); }
        // else { stroke('red'); }
        // line(0, 0, dir[0], dir[1]);
        stroke('green');
        drawPoints(s, times);
        times++;

        if (simplexSize == 0) {
            console.log("Found and exit. simplexSize==0");
            return true;
        }
    }

    console.log("exited GJK. not found");
    return false;
}

/**
 * FUNCTION WILL ALTER "s" and "dir"
 * @param {v2[]} s 
 * @param {v2} dir 
 * @param {number} simplexSize 
 * @returns {number} new simplex size????
 */
function doSimplex(s, dir, simplexSize) {

    let a = s[s.length - 1];
    let ao = vec3.create();
    vec2.subtract(ao, ao, a);
    stroke('magenta');
    line(a[0], a[1], ao[0], ao[1]);

    if (simplexSize == 2) {
        let b = s[s.length - 2];
        let ab = vec3.create();
        vec2.sub(ab, b, a); // seg A->B
        let dp = vec2.dot(ao, ab);
        switch (true) {
            case abs(dp) < 0.01:
                console.log("size2: dp==0");
                return 0;
            case dp < 0:
                console.log("size2: dp<0");
                // origin is beyond the A->B region
                vec2.copy(dir, ao);
                // s = [a];
                s.length = 0;
                s.push(a);
                return 2; // new line, A-> new support
            default: // dp > 0
                console.log("size2: default");
                // origin is in A->B region
                // let ab3 = vec3.fromValues(ab[0], ab[1], 0);
                vec3.cross(ao, ab, ao);
                vec3.cross(ao, ao, ab); // ABxAOxAB
                vec3.normalize(ao, ao);
                vec3.scale(ao, ao, 20); // for show only
                vec2.copy(dir, ao); // back to 2d vector
                // s = [b, a];
                s.length = 0;
                s.push(b);
                s.push(a);
                return 3;
        }
    }

    if (simplexSize == 3) {
        let b = s[s.length - 2];
        let c = s[s.length - 3];
        let ab = vec3.create();
        let ac = vec3.create();
        vec2.subtract(ab, b, a); // seg A->B
        vec2.subtract(ac, c, a); // seg A->C
        // console.log("a", a, "b", b, "c", c);
        // console.log("ao", ao);
        // console.log("ab", ab);
        // console.log("ac", ac);
        let abxao = vec3.cross(vec3.create(), ab, ao);
        let acxao = vec3.cross(vec3.create(), ac, ao);
        // console.log(abxao,acxao);
        switch (true) {
            case abxao[2] * acxao[2] <= 0.01: // cross products are going opposite directions, so AO is between them
                vec2.set(dir, ao[0], ao[1]);
                console.log("size3: inside simplex");
                return 0; //found
            case vec2.dot(ao, ab) < 0 && vec2.dot(ao, ac) < 0: // beyond a
                vec2.copy(dir, ao);
                console.log("size3: past a");
                // s = [a];
                s.length = 0;
                s.push(a);
                return 2;
            default:
                console.log("size3: default");
                // calc normals for both AB and AC and dot each with AO.
                vec3.cross(abxao, ab, abxao);//, ab); // backwards? because of winding direction??
                stroke('pink');
                line(a[0], a[1], b[0], b[1]);//AB
                line(a[0], a[1], abxao[0], abxao[1]);//normal
                // console.log("abxaoxab", abxao);
                if (vec2.dot(ao, abxao) >= 0.01) {
                    console.log("side of ab", vec2.dot(ao, abxao).toFixed(3));
                    if (abs(vec2.dot(ao, abxao)) <= 0.01) { console.log("on ab"); }
                    vec3.normalize(abxao, abxao);
                    vec3.scale(abxao, abxao, 30);
                    vec2.copy(dir, abxao);
                    // s = [b, a];
                    s.length = 0;
                    s.push(b);
                    s.push(a);
                    return 3;
                }
                vec3.cross(acxao, acxao, ac);
                stroke('cyan');
                line(a[0], a[1], c[0], c[1]);//AC
                line(a[0], a[1], acxao[0], acxao[1]); //normal
                // console.log("acxaoxac", acxao);
                if (vec2.dot(ao, acxao) >= 0.01) {
                    console.log("side of ac", vec2.dot(ao, acxao).toFixed(3));
                    if (vec2.dot(ao, acxao) <= 0.01) { console.log("on ac"); }
                    vec3.normalize(acxao, acxao);
                    vec3.scale(acxao, acxao, 30);
                    vec2.copy(dir, acxao);
                    //swap c and b
                    // console.log("before swap", s);
                    // s[s.length - 2] = c;
                    // s[s.length - 3] = b;
                    // console.log("after swap", s);
                    // s = [c, a];
                    s.length = 0;
                    s.push(c);
                    s.push(a);
                    return 3;
                }
        }
    }
    // for (let i = s.length - 2; i >= s.length - simplexSize; i--) {

    // }
    console.log("simplex size -1??");
    return -1;
}

const labels = ["C", "B", "A"];
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