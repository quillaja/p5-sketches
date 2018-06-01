// This file implements simple inverse kinematics. Snake is essentially
// a singly linked list of segments that 'follow' their parent.
//
// last edited: 2018-05-18

// Segment is a node in a singly linked list representing parts of an Snake.
class Segment {

    // makes a new segment
    constructor(dist = 50, col = color(255)) {
        this.child = null;
        this.pos = new p5.Vector(0, 0);
        this.dist = dist;
        this.col = col;
    }

    // adds the 'next' node in the list
    addChild(child) {
        this.child = child;
    }

    // move to within this.dist of target
    update(target) {

        // move this.pos to target.
        this.pos = target;

        if (this.child) {
            // causes the child segment to aim for a spot this.dist away from the
            // current segment's location.
            let newTarget = p5.Vector.sub(this.pos, this.child.pos);
            newTarget.setMag(newTarget.mag() - this.dist).add(this.child.pos);
            this.child.update(newTarget);
        }
    }
}

// Snake is a singly linked list of Segments.
class Snake {

    // makes a new Snake
    constructor(numSegments, segLength) {

        // snake movement parameters
        this.velocity = createVector(0, 0);
        this.speed = random(2, 5);
        this.noff = random(1000);
        this.turnSpeed = random(0.1, 0.8); // low=slow, high=fast
        this.wobble = random(0.5, 0.9); // low=very wobbly, high=less wobbly

        this.glow = 0; // for visual que when snake grows

        // snake linked list data members
        this.head = new Segment(segLength);
        this.tail = this.head;
        this.head.addChild(new Segment(0)); // a fake segment in order to make last real segment draw

        // create initial segments
        this.segLength = segLength;
        for (let i = 0; i < numSegments - 1; i++) {
            this.grow(color(random(360), 100, 100), segLength);
        }
    }

    // causes the head to update and aim towards target.
    update(target) {
        // determine "force" toward target, then scale according to the snake's turn speed
        let force = p5.Vector.sub(target, this.head.pos).setMag(this.turnSpeed);
        // update the velocity with the "force"
        this.velocity.add(force).limit(this.speed);
        // add a little perlin noise wobble to the snake
        this.velocity.rotate(PI / (24 * this.wobble) * (noise(this.noff) * 2 - 1));
        this.noff += 0.1;

        // make the snake's head target at a point in front of it, influenced
        // the above factors.
        this.head.update(p5.Vector.add(this.head.pos, this.velocity));
    }

    // lengthens the snake by 1 segment of given color and size.
    grow(col, size) {
        if (!size) { size = this.segLength; }
        let next = new Segment(size, col); // create new tail segment

        // keep the fake tail, and add it to the new tail
        let fakeTail = this.tail.child;
        next.addChild(fakeTail);
        // reassign the tail's child and make the tail point to the new tail
        this.tail.addChild(next);
        this.tail = next;

        this.glow = 10;
    }

    // draws the snake to the canvas.
    draw() {
        let cur = this.head;
        let next = this.head.child;
        while (next) {
            if (this.glow > 2) {
                strokeWeight(this.glow);
            } else {
                strokeWeight(2);
            }
            stroke(cur.col);
            line(cur.pos.x, cur.pos.y, next.pos.x, next.pos.y);
            cur = next;
            next = next.child;
        }
        if (this.glow) { this.glow -= 0.5; }
    }

    // gets the head position of the snake
    get headPosition() { return this.head.pos; }
}