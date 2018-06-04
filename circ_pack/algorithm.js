// Circle/shape packing based on paper written by Paul Bourke.
//
// Title: "Space Filling: A new algorithm for procedural creation of game assets".
// Link: http://www.paulbourke.net/papers/cgat2013/paper.pdf
//
// Written 2018-06 by Ben (https://github.com/quillaja)

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