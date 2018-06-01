// Grid implements a simple 2D grid of "buckets" which contain objects
// in the simulation. This is used to partition space and improve colision 
// testing or "nearest neighbor" searches.
//
// last edited 2018-05-23
class Grid {
    constructor(horiBuckets, vertBuckets, areaWidth, areaHeight) {
        this._bucketWidth = areaWidth / horiBuckets;
        this._bucketHeight = areaHeight / vertBuckets;
        this.buckets = new Map();
    }

    // converts world coords to non-fractional grid bucket coords.
    worldToGrid(x, y) {
        return [Math.floor(x / this._bucketWidth), Math.floor(y / this._bucketHeight)];
    }

    // converts grid coords to world coords.
    gridToWorld(c, r) {
        return [c * this._bucketWidth, r * this._bucketHeight];
    }

    // adds an object to bucket at gridLoc
    insert(c, r, obj) {
        let k = Grid.hash(c, r);
        if (this.buckets.has(k)) {
            let val = this.buckets.get(k).push(obj);
        } else {
            this.buckets.set(k, [obj]);
        }
    }

    // returns array of objects in bucket at gridLoc.
    get(c, r) {
        let k = Grid.hash(c, r);
        if (this.buckets.has(k)) {
            return this.buckets.get(k);
        } else {
            this.buckets.set(k, []);
            return this.buckets.get(k);
        }
    }

    // gets all buckets in the grid
    getBuckets() { return this.buckets.values(); }

    // converts a column,row pair into an key for the map.
    static hash(c, r) { return c + "," + r; }

}