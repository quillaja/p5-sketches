class Shape {
    constructor(pos, area) {
        this.pos = pos;
        this.area = area;
    }

    draw(color, Do3D = false) {
        throw new Error("Shape: method draw() not implemented.");
    }

    intersects(other) {
        throw new Error("Shape: method intersects() not implemented.");
    }

    insideRect(x, y, w, h) {
        throw new Error("Shape: method insideRect() not implemented.");
    }

    insideCircle(x, y, r) {
        throw new Error("Shape: method insideCircle() not implemented.");
    }
}

/**
 * Defines a circle.
 */
class Circle extends Shape {
    /**
     * Makes a circle.
     * @param {p5.Vector} pos location
     * @param {number} area area
     */
    constructor(pos, area) {
        super(pos, area);
        this.r = Math.sqrt(area / Math.PI);
    }

    /**
     * Draws circle to screen.
     * @param {p5.Color} color fill color
     */
    draw(color, Do3D = false) {
        push();
        noStroke();
        // colorMode(HSB);
        translate(this.pos);
        if (Do3D) { // 3D specific drawing things
            specularMaterial(color);
            sphere(this.r);
        }
        else { // 2d drawing things
            fill(color);
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

    insideCircle(x, y, r) {
        let d = createVector(x, y).dist(this.pos);
        return d <= r - this.r;
    }

    /**
     * Generates a circle and determines if it's valid.
     * @param {Circle[]} others the list of other circles
     * @param {number} a0 the area of the initial circle
     * @param {Shape} boundingShape a shape to be filled
     * @returns {[boolean, Circle]} where bool is true if the Circle is valid.
     */
    static Generate(others, a0, boundingShape) {
        let c = new Circle(
            createVector(random(width), random(height)),
            a0 * g(others.length));

        // check that circle is contained in the bounds
        let isContained;
        if (boundingShape instanceof AARect) {
            // it's an AABB (rect), d1=width, d2=height
            isContained = c.insideRect(
                boundingShape.nearCorner.x,
                boundingShape.nearCorner.y,
                boundingShape.width,
                boundingShape.height);
        } else if (boundingShape instanceof Circle) {
            // it's a circle, d1=radius
            isContained = c.insideCircle(boundingShape.pos.x, boundingShape.pos.y, boundingShape.r);
        } else {
            throw new Error("Generate: boundingShape not Circle or AARect.");
        }
        // check that circle does not intersect with any of the existing circles.
        // remember that c is NOT in circles[] yet. This simplifies things.
        let noIntersection = others.every(other => !c.intersects(other));
        return [isContained && noIntersection, c]; // [ok, circle]
    }

}

/**
 * Represents an axis aligned rectangle.
 */
class AARect extends Shape {
    constructor(center, aspectRatio, area) {
        super(center, area);
        // deriving other rect metrics from area and aspect ratio.
        // aspect = width / height
        // area = width * height
        // width = height * aspect
        // area = aspect * height^2
        // height = sqrt(area/aspect)
        this.height = Math.sqrt(area / aspectRatio);
        this.width = this.height * aspectRatio;

        this.left = this.pos.x - this.width / 2;
        this.right = this.pos.x + this.width / 2;
        this.top = this.pos.y - this.height / 2;
        this.bottom = this.pos.y + this.height / 2;
        this.nearCorner = createVector(this.left, this.top);
        this.farCorner = createVector(this.right, this.bottom);
    }
    /**
     * Draws the rect to the screen.
     * @param {p5.Color} color fill color
     * @param {boolean} Do3D true to draw the shape in "3D"
     */
    draw(color, Do3D = false) {
        push();
        noStroke();
        translate(this.pos);
        if (Do3D) {
            specularMaterial(color);
            box(this.width, this.height, this.width);
        } else {
            fill(color);
            rect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        pop();
    }

    /**
     * True if this rect and the other intersect.
     * @param {AARect} other another rect to test
     */
    intersects(other) {
        return !(
            this.left > other.right || this.right < other.left ||
            this.top > other.bottom || this.bottom < other.top
        );
    }

    /**
     * True if this rect is inside the rect defined by the parameters.
     * @param {number} x x-coord of corner close to origin
     * @param {number} y y-coord of corner close to origin
     * @param {number} w width of the rect
     * @param {number} h height of the rect
     */
    insideRect(x, y, w, h) {
        return this.top >= y && this.bottom <= y + h &&
            this.left >= x && this.right <= x + w;
    }

    /**
     * True if this rect is inside the circle defined by the parameters.
     * @param {number} x x-coord of the center
     * @param {number} y y-coord of the center
     * @param {number} r radius
     */
    insideCircle(x, y, r) {
        let cornerDist = [
            dist(x, y, this.left, this.top),
            dist(x, y, this.left, this.bottom),
            dist(x, y, this.right, this.top),
            dist(x, y, this.right, this.bottom)
        ];
        for (const d of cornerDist) {
            if (d > r) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generates a rectangle and determines if it's valid.
     * 
     */
    poop() { }

    /**
     * Creates a random AARect and determines if it's valid.
     * @param {AARect[]} others the list of other rects
     * @param {number} a0 the area of the initial rect
     * @param {Shape} boundingShape a shape to be filled
     * @returns {[boolean, AARect]} where bool is true if the AARect is valid.
     */
    static Generate(others, a0, boundingShape) {
        let r = new AARect(
            createVector(random(width), random(height)),
            random(0.5, 2), // 1/2 to 2/1
            a0 * g(others.length));

        // check that rect is contained in the bounds
        let isContained;
        if (boundingShape instanceof AARect) {
            // it's an AABB (rect), d1=width, d2=height
            isContained = r.insideRect(
                boundingShape.nearCorner.x,
                boundingShape.nearCorner.y,
                boundingShape.width,
                boundingShape.height);
        } else if (boundingShape instanceof Circle) {
            // it's a circle, d1=radius
            isContained = r.insideCircle(boundingShape.pos.x, boundingShape.pos.y, boundingShape.r);
        } else {
            throw new Error("Generate: boundingShape not Circle or AARect.");
        }
        // check that rect does not intersect with any of the existing rects.
        // remember that r is NOT in shapes[] yet. This simplifies things.
        let noIntersection = others.every(other => !r.intersects(other));
        return [isContained && noIntersection, r]; // [ok, rect]
    }
}