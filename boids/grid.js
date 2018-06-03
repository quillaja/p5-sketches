// last edited 2018-05-23

/**
 * Grid implements a simple 2D grid of "buckets" which contain objects
 * in the simulation. This is used to partition space and improve colision 
 * testing or "nearest neighbor" searches.
 */
class Grid {
    /**
     * Creates a new Grid, dividing the space starting at (0,0) into
     * a series of rectangular "buckets".
     * @param {number} horiBuckets the number of horizontal buckets
     * @param {number} vertBuckets the number of vertical buckets
     * @param {number} areaWidth width of the area to partition
     * @param {number} areaHeight height of the area to partition
     */
    constructor(horiBuckets, vertBuckets, areaWidth, areaHeight) {
        this._bucketWidth = areaWidth / horiBuckets;
        this._bucketHeight = areaHeight / vertBuckets;
        this.buckets = new Map();
    }

    /**
     * Converts world coords to non-fractional grid bucket coords.
     * @param {number} x the world x-coord
     * @param {number} y the world y-coord
     * @returns the grid coord (c,r) of the grid into which the (x,y) coord falls
     * as an array [c,r].
     */
    worldToGrid(x, y) {
        return [Math.floor(x / this._bucketWidth), Math.floor(y / this._bucketHeight)];
    }

    /**
     * Converts grid coords to world coords.
     * @param {number} c grid column (x) coord
     * @param {number} r grid row (y) coord
     * @returns the (x,y) world coordinate of the grid location as a length 2
     * array [x,y].
     */
    gridToWorld(c, r) {
        return [c * this._bucketWidth, r * this._bucketHeight];
    }

    /**
     * Adds an object to bucket at grid location (c,r).
     * @param {number} c column coord for insertion
     * @param {number} r row coord for insertion
     * @param {any} obj item to be inserted
     */
    insert(c, r, obj) {
        let k = Grid.hash(c, r);
        if (this.buckets.has(k)) {
            let val = this.buckets.get(k).push(obj);
        } else {
            this.buckets.set(k, [obj]);
        }
    }

    /**
     * Returns a list of items at grid coordinate (c,r).
     * @param {number} c column coordinate
     * @param {number} r row coordinate
     */
    get(c, r) {
        let k = Grid.hash(c, r);
        if (this.buckets.has(k)) {
            return this.buckets.get(k);
        } else {
            this.buckets.set(k, []);
            return this.buckets.get(k);
        }
    }

    /** Gets all buckets in the grid as a list of lists. */
    getBuckets() { return this.buckets.values(); }

    /** converts a column,row pair into an key for the map. */
    static hash(c, r) { return c + "," + r; }

}