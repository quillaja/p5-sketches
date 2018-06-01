// Implements a quad tree for region querying.
//
// last edited: 2018-05-25

// A rectangle defined by its lower (in magnitude) and higher (in magnitude) 
// corners. Also implements point and rectangle collision.
class Rect {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    get Center() { return [this.x1 + (0.5 * this.x2 - this.x1), this.y1 + (0.5 * this.y2 - this.y1)]; }
    get Width() { return this.x2 - this.x1; }
    get Height() { return this.y2 - this.y1; }
    get Area() { return this.Width * this.Height; }

    // Returns true if this rect contains the point at (x,y).
    contains(x, y) {
        return this.x1 <= x && x < this.x2 && this.y1 <= y && y < this.y2;
    }

    // Returns true if the 'other' rect intersects with this one.
    intersects(other) {
        return !(this.x1 > other.x2 || this.x2 < other.x1) &&
            !(this.y1 > other.y2 || this.y2 < other.y1);
    }

    // Draws a rect to the screen.
    draw() {
        rect(this.x1, this.y1, this.Width, this.Height);
    }
}

// A very simple 2D point.
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// A quad-tree whose nodes can contain an arbitrary number of points. If 'toLeaves'
// is set to 'true', only the leaves of the tree will contain points (intermediate 
// nodes will have a capacity of 0).
class QuadTree {
    constructor(range, capacity = 1, toLeaves = false) {
        this.range = range;
        this.capacity = capacity;
        if (this.capacity < 1) { this.capacity = 1; }
        this.points = [];

        // 4 quadrants L = lower side, H = higher side.
        this.LL = null;
        this.LH = null;
        this.HL = null;
        this.HH = null;

        this._isSplit = false;
        this._pushToLeaves = toLeaves;
    }

    // inserts a Point into the tree. Returns true/false if the point was 
    // inserted.
    insert(point) {
        if (!this.range.contains(point.x, point.y)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
        } else {
            if (!this.isSplit()) {
                this.split();
            }
            this.LL.insert(point);
            this.LH.insert(point);
            this.HL.insert(point);
            this.HH.insert(point);
        }

        return true;
    }

    // only need to check one for null, since they're all assigned
    // when split() is called.
    isSplit() { return this._isSplit; }

    // splits this node into 4 children. pushes points from this node down to 
    // children if the tree is configured to do so.
    split() {
        let w = this.range.Width / 2;
        let h = this.range.Height / 2;
        this.LL = new QuadTree(
            new Rect(this.range.x1, this.range.y1, this.range.x1 + w, this.range.y1 + h),
            this.capacity,
            this._pushToLeaves);
        this.LH = new QuadTree(
            new Rect(this.range.x1 + w, this.range.y1, this.range.x2, this.range.y1 + h),
            this.capacity,
            this._pushToLeaves);
        this.HL = new QuadTree(
            new Rect(this.range.x1, this.range.y1 + h, this.range.x1 + w, this.range.y2),
            this.capacity,
            this._pushToLeaves);
        this.HH = new QuadTree(
            new Rect(this.range.x1 + w, this.range.y1 + h, this.range.x2, this.range.y2),
            this.capacity,
            this._pushToLeaves);

        this._isSplit = true;

        // if the quadtree is set to push all points down to the leaves,
        // then this will re-insert the points currently contained in this node.
        // because capacity is set to 0, the re-inserted points will go to the 
        // new children, as will any newly inserted future points.
        if (this._pushToLeaves) {
            this.capacity = 0;
            while (this.points.length > 0) {
                let p = this.points.pop();
                this.insert(p);
            }
        }
    }

    // Returns all points contained in the 'range' Rect. If 'found' is specified,
    // the points will be appended to that array. Returns a reference to the 
    // found array.
    query(range, found = []) {
        if (!this.range.intersects(range)) {
            return found;
        }

        for (const p of this.points) {
            if (range.contains(p.x, p.y)) {
                found.push(p);
            }
        }

        if (this.isSplit()) {
            this.LL.query(range, found);
            this.LH.query(range, found);
            this.HL.query(range, found);
            this.HH.query(range, found);
        }

        return found;
    }

    // draws the quad tree (its regions) to the screen.
    draw() {
        this.range.draw();
        if (this.isSplit()) {
            this.LL.draw();
            this.LH.draw();
            this.HL.draw();
            this.HH.draw();
        }
    }
}