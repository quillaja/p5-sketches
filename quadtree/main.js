// Uses a quadtree to partition space and perform spacial queries.
//
// last edited 2018-05-29

// the points in question
var points;

// "modes" for display
const TREE_DRAW_MODE = "drawing tree, no collision";
const TREE_COLLIDE_MODE = "using tree for collision testing";
const NO_TREE_MODE = "using standard collision testing";

var mode = TREE_DRAW_MODE;

function setup() {
    let params = getURLParams();

    createCanvas(windowWidth, windowHeight - 5);

    const density = 500; // sq-pix/object
    let n = (width * height) / density;
    if (params.number) { n = params.number; } // allow user to set num points

    points = [];
    for (let i = 0; i < n; i++) {
        let p = new Point(random(width), random(height));
        points.push(p);
    }
}

function draw() {
    background(50);
    noFill();
    stroke(255);
    strokeWeight(1);

    // display info
    text("mode: " + mode + ". Click to toggle.", 16, 16);
    text("fps: " + round(frameRate()), 16, 32);
    text("objects: " + points.length, 16, 48);

    // draw points
    for (const p of points) {
        ellipse(p.x, p.y, 1); // draws point
    }

    // do the different display methods
    if (mode == TREE_COLLIDE_MODE) {
        treeCollision();
    } else if (mode == NO_TREE_MODE) {
        stdCollision();
    } else if (mode == TREE_DRAW_MODE) {
        let tree = new QuadTree(new Rect(0, 0, width, height), 1);
        for (const p of points) {
            tree.insert(p);
        }
        strokeWeight(0.25);
        tree.draw();

        // for fun, let mouse highlight some points
        strokeWeight(1);
        stroke(0, 0, 255);
        let mouse = new Rect(mouseX - 50, mouseY - 50, mouseX + 50, mouseY + 50);
        mouse.draw();
        for (const f of tree.query(mouse)) {
            ellipse(f.x, f.y, 4);
        }
    }

    // jitter points
    for (const p of points) {
        p.x += random(-2, 2);
        p.y += random(-2, 2);
    }
}

// change display methods
function mouseClicked() {
    if (mode == TREE_DRAW_MODE) {
        mode = TREE_COLLIDE_MODE;
    } else if (mode == TREE_COLLIDE_MODE) {
        mode = NO_TREE_MODE;
    } else {
        mode = TREE_DRAW_MODE;
    }
}

// check each point for collision with nearby points, using the quadtree.
// Use 'search radius' of 2, if collision happens, draw green and larger.
function treeCollision() {
    // build tree
    let tree = new QuadTree(new Rect(0, 0, width, height), 1);
    for (const p of points) {
        tree.insert(p);
    }
    // search near each point for candidates which can then be checked
    // using the more accurate circle-circle method.
    for (const p of points) {
        // use tight AABB as the search region
        const sr = 2;
        let search = new Rect(p.x - sr, p.y - sr, p.x + sr, p.y + sr);
        let found = tree.query(search);
        if (found.length > 1) {
            stroke(0, 255, 0);
            for (const other of found) {
                // found will include the current point, so it can be drawn
                // just like any other found points, only when found.length > 1
                let distsq = (p.x - other.x) * (p.x - other.x) + (p.y - other.y) * (p.y - other.y);
                if (p !== other && distsq < sr * sr) {
                    ellipse(other.x, other.y, 4);
                }
            }
        }
    }
}

// check each point for collision with nearby points, using std O(n^2) method.
// Use 'search radius' of 2, if collision happens, draw green and larger.
function stdCollision() {
    for (let i = 0; i < points.length; i++) {
        let a = points[i];
        for (let j = i + 1; j < points.length - 1; j++) {
            let b = points[j];
            let distsq = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
            if (distsq < 4) { // search radius of 2
                stroke(0, 255, 0);
                ellipse(a.x, a.y, 4);
                ellipse(b.x, b.y, 4);
            }
        }
    }
}