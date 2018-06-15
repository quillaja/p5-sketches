let lines;
let c;
let shapes;

function setup() {
    createCanvas(800, 800);
    lines = [
        new Line(200, 200, 500, 400),
        new Line(600, 100, 500, 200),
        new Line(50, 700, 60, 700),
        new Line(450, 400, 450, 600)
    ];
    // c = new Circle(10, 10, 50);
    c = new Line(0, 0, -20, 20);
    shapes = [
        Polygon.Rect(
            random(200, 600), random(200, 600),
            random(20, 200), random(20, 200),
            random(-QUARTER_PI, QUARTER_PI)),
        Polygon.EquilateralTriangle(
            random(200, 600), random(200, 600),
            random(10, 400),
            random(0, PI + HALF_PI)),
        Polygon.IsoscelesTriangle(
            random(200, 600), random(200, 600),
            random(10, 400), random(10, 200),
            random(0, PI + HALF_PI)),
        Polygon.RegularNSided(
            random(100, 700), random(100, 700),
            random(3, 10), random(10, 200),
            random(0, PI))
    ];

    noLoop();
}

function draw() {
    background(50);
    // c.moveTo(mouseX, mouseY);

    // let col = color(255);
    // for (const l of lines) {
    //     // let [does, pos, pc] = lineCircle(l, c);
    //     let [does, pos] = lineLine(c, l);
    //     // let [does, pos] = pointLine(createVector(mouseX, mouseY), l);
    //     if (does) {
    //         col = color(255, 0, 0);
    //     }
    //     l.draw(color(255));
    //     if (pos) {
    //         noStroke();
    //         fill(0, 255, 0);
    //         ellipse(pos.x, pos.y, 4);
    //     }
    //     // if (pc) {
    //     //     for (const p of pc) {
    //     //         noStroke();
    //     //         fill(0, 255, 255);
    //     //         ellipse(p.x, p.y, 5);
    //     //     }
    //     // }
    // }

    // for (const t of [shapes[1], shapes[2]]) {
    //     t.draw(color(255));
    //     if (pointTriange(createVector(mouseX, mouseY), t.verts)) {
    //         // console.log("mouse interected a triangle");
    //         t.draw(color(0, 255, 0));
    //     }
    // }

    // // for (const p of shapes) {
    // //     if (polygonCircle(p, c)) {
    // //         p.draw(color(random(255), random(255), random(255)));
    // //     } else {
    // //         p.draw(color(255));
    // //     }
    // // }

    // c.draw(col);

    let v = [];
    let n = floor(random(3, 20));
    for (let i = 0; i < n; i++) {
        v.push(p5.Vector.fromAngle(i * TWO_PI / n, random(200, 400)));
    }
    let p = new Polygon(v);

    translate(width / 2, height / 2);
    p.draw('white');
    if (p.isConvex()) {
        p.draw('green');
    } else {
        p.draw('red');
    }
}

function keyPressed() {
    if (keyCode == ENTER) {
        redraw();
    }
}

/**
 * Intersect a point and a triangle.
 * @param {p5.Vector} pt the point (as a vector)
 * @param {p5.Vector[]} tri an array of 3 vectors representing verticies.
 */
function pointTriange(pt, tri) {
    tri = tri.slice();
    tri.push(tri[0]); // make easier to deal with 'wrapping' back to first point
    let crosses = [];
    for (let i = 0; i < tri.length - 1; i++) {
        crosses.push(
            p5.Vector.cross(
                p5.Vector.sub(tri[i + 1], tri[i]),
                p5.Vector.sub(tri[i], pt)
            )
        );
    }

    // check that cross products are either all positive or all negative.
    // do both to account for opposite "winding" directions.
    // P5 seems to use right-handed rule and 'downward' +Y axis, so +Z
    // is 'into' screen. Thus:
    // if CW winding, cross products are all positive,
    // CCW winding are all negative (?)
    return crosses.every(v => v.z >= 0) || crosses.every(v => v.z <= 0);
}

/**
 * intersect 2 lines
 * @param {Line} a one
 * @param {Line} b other
 * @return {[boolean,p5.Vector]} result
 */
function lineLine(a, b) {

    // test AABB first to prevent doing unnecessary calculations
    let intersectAABB = !(
        min(a.p1.x, a.p2.x) > max(b.p1.x, b.p2.x) || // left a > right b
        max(a.p1.x, a.p2.x) < min(b.p1.x, b.p2.x) || // right a < left b
        min(a.p1.y, a.p2.y) > max(b.p1.y, b.p2.y) || // bottom a > top b
        max(a.p1.y, a.p2.y) < min(b.p1.y, b.p2.y)    // top a < bottom b
    );

    if (!intersectAABB) {
        return [false, undefined];
    }

    // derivation
    // m = y2-y1/x2-x1
    // y = mx+b
    // y - mx = b
    //   ma*x + ba = mb*x + bb
    //   ma*x - mb*x = bb-ba
    //   x(ma-mb) = bb-ba
    //   x = (bb-ba)/(ma-mb)
    // p = p0+u(p1-p0)
    //   u = (p-p0)/(p1-p0)

    let da = p5.Vector.sub(a.p2, a.p1);
    let db = p5.Vector.sub(b.p2, b.p1);
    let ma = da.y / da.x; // what if line is vertical? see below
    let mb = db.y / db.x;

    // special case
    // lines are parallel (including 2 vertical lines)
    // slopes are the same (or both "+/-infinity")
    if (ma == mb || (da.x == 0 && db.x == 0)) {
        // must check if either of a's points are on b AND vice-versa.
        let intersect =
            pointLine(a.p1, b)[0] ||
            pointLine(a.p2, b)[0] ||
            pointLine(b.p1, a)[0] ||
            pointLine(b.p1, a)[0];

        // undefined intersection point...there are infinite points.
        return [intersect, undefined];
    }

    let ba = a.p1.y - ma * a.p1.x;
    let bb = b.p1.y - mb * b.p1.x;

    // general case: intersect at (px,py)
    let px = (bb - ba) / (ma - mb);
    let py = ma * px + ba;

    // special case 
    // already took care of parallel lines, so only a OR b could be vertical.
    if (da.x == 0) { // a is vertical, b is not
        px = a.p1.x;
        py = mb * px + bb;
    } else if (db.x == 0) { // b is vertical, a is not
        px = b.p1.x;
        py = ma * px + ba;
    }
    let p = createVector(px, py);

    // get vector from p1 to p = vec(p,p1),
    // since p IS somewhere on the line (not segment), vec(p,p1) will
    // be "on top of" line, and thus dot product divided by the
    // square of the segment's magnitude will give p's porportional distance
    // from p1.
    // do for both segments.
    let ap = p5.Vector.sub(p, a.p1);
    let ua = p5.Vector.dot(ap, da) / da.magSq();

    let bp = p5.Vector.sub(p, b.p1);
    let ub = p5.Vector.dot(bp, db) / db.magSq();

    // if p is on a and b, u is in [0,1]
    return [(0 <= ua && ua <= 1) && (0 <= ub && ub <= 1), p];
}

/**
 * is point on line?
 * @param {p5.Vector} pt point
 * @param {Line} ln line
 * @return {[boolean,number]} bool, u = porpotion of sub(ln.p2, ln.p1)
 */
function pointLine(pt, ln) {
    // use similar method to the last part of lineLine()
    let dln = p5.Vector.sub(ln.p2, ln.p1);
    let lnp = p5.Vector.sub(pt, ln.p1);
    if (p5.Vector.cross(dln, lnp).mag() > 0) { //pt is not on ln
        return [false, undefined];
    }
    let u = p5.Vector.dot(lnp, dln) / dln.magSq();
    return [0 <= u && u <= 1, u];
}

/**
 * intersect a line and circle (or sphere)
 * @param {Line} l the line
 * @param {Circle} c the circle
 * @returns {[boolean, p5.Vector, p5.Vector[]]} true if intersects
 */
function lineCircle(l, c) {

    // check for overlap of AABBs of circle and line seg
    let inBB = !(
        min(l.p1.x, l.p2.x) > c.center.x + c.r ||
        max(l.p1.x, l.p2.x) < c.center.x - c.r ||
        min(l.p1.y, l.p2.y) > c.center.y + c.r ||
        max(l.p1.y, l.p2.y) < c.center.y - c.r ||
        min(l.p1.z, l.p2.z) > c.center.z + c.r ||
        max(l.p1.z, l.p2.z) < c.center.z - c.r
    );

    if (inBB) {

        // determine if the circle is within radius r of either of the 
        // segment's end points.
        let inEnds = !(l.p1.dist(c.center) > c.r && l.p2.dist(c.center) > c.r);

        // often use p2-p1, so this is convenience
        let lseg = p5.Vector.sub(l.p2, l.p1);

        // unused
        // check that the circle intersects anywhere on the LINE,
        // which includes the extensions of the segment past its ends.
        // let ac = pow(lseg.x, 2) + pow(lseg.y, 2) + pow(lseg.z, 2);
        // let bc = 2 * (lseg.x * (l.p1.x - c.center.x) + lseg.y * (l.p1.y - c.center.y) + lseg.z * (l.p1.z - c.center.z));
        // let cc = pow(c.center.x, 2) + pow(c.center.y, 2) + pow(c.center.z, 2) +
        //     pow(l.p1.x, 2) + pow(l.p1.y, 2) + pow(l.p1.z, 2) -
        //     (2 * (c.center.x * l.p1.x + c.center.y * l.p1.y + c.center.z * l.p1.z)) -
        //     pow(c.r, 2);
        //
        // let intersectsLine = 0 <= bc * bc - 4 * ac * cc;

        // check for the point P on the segment such that a segment between
        // the point and the center of the circle is perpendicular to the
        // original segment. u is "percent length" of the seg.
        let num = lseg.x * (c.center.x - l.p1.x) +
            lseg.y * (c.center.y - l.p1.y) +
            lseg.z * (c.center.z - l.p1.z);
        let den = pow(lseg.x, 2) + pow(lseg.y, 2) + pow(lseg.z, 2);
        let u = num / den;

        let intersectsSeg = (0 <= u && u <= 1);

        // find the point P, determine if the distance between P and circle's
        // center is less than circle's radius. if so, it may intersect.
        let p = p5.Vector.add(l.p1, lseg.mult(u));
        let cp = p5.Vector.sub(p, c.center);
        let distCP = cp.mag();
        let inDist = distCP <= c.r;
        let pc = undefined;
        if (inDist) {
            let centerAngle = PI - (HALF_PI + asin(sin(HALF_PI) / c.r * distCP));
            pc = [
                cp.copy().rotate(centerAngle).setMag(c.r).add(c.center),
                cp.copy().rotate(-centerAngle).setMag(c.r).add(c.center)
            ];
        }
        // the circle and line segment intersect if:
        // 1. the circle is with radius r of either end points of the segment
        // OR
        // 2a. the point P is on the segment AND
        // 2b. the distance between P and circle's center is <= radius r.
        return [(intersectsSeg && inDist) || inEnds, p, pc];
    }
    return [false, undefined, undefined];
}

/**
 * intersects a polygon and circle
 * @param {Polygon} poly polygon
 * @param {Circle} circ circle
 */
function polygonCircle(poly, circ) {
    // can't determine if the cirlce is INSIDE the polygon but not touching edges!
    return poly.edges.some((e) => lineCircle(e, circ)[0])// || poly.center.dist(circ.center) < poly.r;
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.p1 = createVector(x1, y1);
        this.p2 = createVector(x2, y2);
    }

    draw(color) {
        push();
        stroke(color);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        pop();
    }

    moveTo(x, y) {
        let dp = p5.Vector.sub(this.p2, this.p1);
        this.p1.set(x, y);
        this.p2.set(x + dp.x, y + dp.y);
    }
}

class Circle {
    constructor(x, y, r) {
        this.center = createVector(x, y);
        this.r = r;
    }

    draw(color) {
        push();
        stroke(color);
        noFill();
        ellipse(this.center.x, this.center.y, this.r * 2);
        pop();
    }

    moveTo(x, y) {
        this.center.x = x;
        this.center.y = y;
    }
}

class Polygon {
    /**
     * 
     * @param {p5.Vector[]} verts Clockwise list of verticies
     */
    constructor(verts) {
        this.verts = verts;
        this.edges = [];
        for (let i = 0; i < verts.length - 1; i++) {
            this.edges.push(new Line(
                verts[i].x, verts[i].y,
                verts[i + 1].x, verts[i + 1].y
            ));
        }
        this.edges.push(new Line(
            verts[verts.length - 1].x, verts[verts.length - 1].y,
            verts[0].x, verts[0].y
        ))

        this.center = createVector(0, 0, 0);
        verts.forEach((v) => this.center.add(v));
        this.center.div(verts.length);

        this.r = verts.map((v) => this.center.dist(v)).reduce((acc, d) => max(acc, d), -1);
    }

    draw(color) {
        for (const e of this.edges) {
            e.draw(color);
        }
        push();
        stroke(color);
        point(this.center.x, this.center.y);
        pop();
    }

    /**
     * @returns {boolean} true if the polygon is convex. false otherwise.
     */
    isConvex() {

        // property is already set, don't need to do the work again.
        if (this.hasOwnProperty('_isConvex') && this._isConvex != undefined) {
            return this._isConvex;
        }

        // do the work, then set the property
        let v = [this.verts[this.verts.length - 1], ...this.verts, this.verts[0]];
        // console.log(v);
        for (let i = 1; i < v.length - 1; i++) {
            let to = p5.Vector.sub(v[i], v[i - 1]);
            let from = p5.Vector.sub(v[i + 1], v[i]);
            let toNormal = p5.Vector.cross(createVector(0, 0, 1), to);
            let dot = toNormal.dot(from);
            // console.log("dot: " + dot + " to, toNorm, from ", to, toNormal, from);
            if (dot < 0) {
                this._isConvex = false;
                // console.log("dot < 0");
                return false;
            }
        }

        this._isConvex = true;
        return true;
    }

    static Rect(xcenter, ycenter, width, height, angle) {
        let center = createVector(xcenter, ycenter);
        let corners = [
            createVector(- width / 2, - height / 2).rotate(angle).add(center),
            createVector(width / 2, - height / 2).rotate(angle).add(center),
            createVector(width / 2, height / 2).rotate(angle).add(center),
            createVector(- width / 2, height / 2).rotate(angle).add(center),
        ];
        return new Polygon(corners);
    }

    static EquilateralTriangle(xcenter, ycenter, height, angle) {
        let center = createVector(xcenter, ycenter);
        let top = createVector(0, -height / 2);
        let corners = [
            top.copy().rotate(angle).add(center),
            top.copy().rotate(angle + TWO_PI / 3).add(center),
            top.copy().rotate(angle + 2 * TWO_PI / 3).add(center)

        ];
        return new Polygon(corners);
    }

    static IsoscelesTriangle(xcenter, ycenter, height, base, angle) {
        let center = createVector(xcenter, ycenter);
        let corners = [
            createVector(0, -height * 2 / 3).rotate(angle).add(center),
            createVector(base / 2, height * 1 / 3).rotate(angle).add(center),
            createVector(-base / 2, height * 1 / 3).rotate(angle).add(center)

        ];
        return new Polygon(corners);
    }

    static RegularNSided(xcenter, ycenter, sides, circumradius, angle) {
        sides = floor(sides);
        if (sides < 3) {
            throw new Error("Argument error: 'sides' must be 3 or more.");
        }

        let center = createVector(xcenter, ycenter);
        let inAngle = TWO_PI / sides;
        let top = createVector(0, -circumradius);
        let corners = [];
        for (let i = 0; i < sides; i++) {
            let v = top.copy().rotate(i * inAngle + angle).add(center);
            corners.push(v);
        }
        return new Polygon(corners);
    }
}