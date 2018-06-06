let lines;
let c;

function setup() {
    createCanvas(800, 800);
    lines = [
        new Line(200, 200, 500, 400),
        new Line(600, 100, 500, 200),
        new Line(50, 700, 60, 700)
    ];
    c = new Circle(10, 10, 50);
}

function draw() {
    background(50);
    c.moveTo(mouseX, mouseY);
    let col = color(255);
    for (const l of lines) {
        let [does, pos, pc] = intersect(l, c);
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
    c.draw(col);
}

/**
 * intersect a line and circle
 * @param {Line} l the line
 * @param {Circle} c the circle
 * @returns {[boolean, p5.Vector, p5.Vector[]]} true if intersects
 */
function intersect(l, c) {

    // check for overlap of AABBs of circle and line seg
    let inBB = !(
        min(l.p1.x, l.p2.x) > c.center.x + c.r ||
        max(l.p1.x, l.p2.x) < c.center.x - c.r ||
        min(l.p1.y, l.p2.y) > c.center.y + c.r ||
        max(l.p1.y, l.p2.y) < c.center.y - c.r ||
        min(l.p1.z, l.p2.z) > c.center.z + c.r ||
        max(l.p1.z, l.p2.z) < c.center.z - c.r
    );

    if (true) {

        // determine if the circle is within radius r of either of the 
        // segment's end points.
        let inEnds = !(l.p1.dist(c.center) > c.r && l.p2.dist(c.center) > c.r);



        let lseg = p5.Vector.sub(l.p2, l.p1);
        // check that the circle intersects anywhere on the LINE,
        // which includes the extensions of the segment past its ends.
        // let ac = pow(lseg.x, 2) + pow(lseg.y, 2) + pow(lseg.z, 2);
        // let bc = 2 * (lseg.x * (l.p1.x - c.center.x) + lseg.y * (l.p1.y - c.center.y) + lseg.z * (l.p1.z - c.center.z));
        // let cc = pow(c.center.x, 2) + pow(c.center.y, 2) + pow(c.center.z, 2) +
        //     pow(l.p1.x, 2) + pow(l.p1.y, 2) + pow(l.p1.z, 2) -
        //     (2 * (c.center.x * l.p1.x + c.center.y * l.p1.y + c.center.z * l.p1.z)) -
        //     pow(c.r, 2);

        // let intersectsLine = 0 <= bc * bc - 4 * ac * cc;

        // check for the point P on the segment such that a segment between
        // the point and the center of the circle is perpendicular to the
        // original segment. u is "percent length" of the seg.
        let num = lseg.x * (c.center.x - l.p1.x) + lseg.y * (c.center.y - l.p1.y) + lseg.z * (c.center.z - l.p1.z);
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
            if (isNaN(centerAngle)) {
                console.log(c.r, distCP);
            }
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