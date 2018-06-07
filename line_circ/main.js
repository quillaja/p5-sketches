let lines;
let c;
let shapes;

function setup() {
    createCanvas(800, 800);
    lines = [
        // new Line(200, 200, 500, 400),
        // new Line(600, 100, 500, 200),
        // new Line(50, 700, 60, 700),
        // new Line(450, 400, 450, 600)
    ];
    c = new Circle(10, 10, 50);
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

}

function draw() {
    background(50);
    c.moveTo(mouseX, mouseY);
    let col = color(255);
    for (const l of lines) {
        let [does, pos, pc] = lineCircle(l, c);
        if (does) {
            col = color(255, 0, 0);
        }
        l.draw(color(255));
        if (pos) {
            noStroke();
            fill(0, 255, 0);
            ellipse(pos.x, pos.y, 4);
        }
        if (pc) {
            for (const p of pc) {
                noStroke();
                fill(0, 255, 255);
                ellipse(p.x, p.y, 5);
            }
        }
    }


    for (const p of shapes) {
        if (polygonCircle(p, c)) {
            p.draw(color(random(255), random(255), random(255)));
        } else {
            p.draw(color(255));
        }
    }

    c.draw(col);
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