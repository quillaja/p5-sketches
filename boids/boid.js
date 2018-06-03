// last edited 2018-05-23

/**
 * Boid implements a simple boid object with cohesion, separation, alignment,
 * wander, and avoidance.
 */
class Boid {
    // Various 'constants' used a boid params.
    // could be made instance variables to make boids more individual, etc.
    static get MAX_VELOCITY() { return 3; }
    static get MAX_FORCE() { return 0.03; }
    static get COHESION() { return 1.0; }
    static get SEPARATION() { return 1.5; }
    static get ALIGNMENT() { return 1.0; }
    static get WANDER() { return 1.0; }
    static get AVOID() { return 4; }
    static get SEP_DIST() { return 50; }
    static get AVOID_DIST() { return 100; }

    /**
     * Creates a new boid with position (x,y), a random velocity [-5,5], and
     * no acceleration.
     * @param {number} x starting x position of the boid
     * @param {number} y starting y position of the boid
     */
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(random(-5, 5), random(-5, 5));
        this.acceleration = createVector(0, 0);
    }

    /** Updates the boid's position using its velocity. Wraps screen. */
    updatePosition() {
        this.vel.add(this.acceleration);
        this.vel.limit(Boid.MAX_VELOCITY);

        // steer out of bounds back in
        // if (this.pos.x > width) { this.vel.x = -Boid.MAX_VELOCITY / 2; }
        // if (this.pos.x < 0) { this.vel.x = Boid.MAX_VELOCITY / 2; }
        // if (this.pos.y > height) { this.vel.y = -Boid.MAX_VELOCITY / 2; }
        // if (this.pos.y < 0) { this.vel.y = Boid.MAX_VELOCITY / 2; }

        this.pos.add(this.vel);
        this.acceleration.mult(0);

        // screen wrap
        if (this.pos.x > width) { this.pos.x = 0; }
        if (this.pos.x < 0) { this.pos.x = width; }
        if (this.pos.y > height) { this.pos.y = 0; }
        if (this.pos.y < 0) { this.pos.y = height; }
    }

    /**
     * Draws the boid to the screen.
     * @param {p5.Color} color an optional color for the boid's fill
     */
    draw(color) {
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading() - HALF_PI);
        scale(5);
        strokeWeight(0.1);
        if (color) { fill(color); }
        else { fill(255); }
        triangle(0, 2, -1, -2, 1, -2);
        resetMatrix();
    }

    /**
     * Applies the 'cohesion' force to the boid, which draws the boid toward 
     * the average position of the boids in neighbors.
     * @param {Boid[]} neighbors a list of neighboring boids
     */
    applyCohesion(neighbors) {
        let avgPos = createVector(0, 0);
        let count = 0;
        for (const n of neighbors) {
            if (n !== this) {
                avgPos.add(n.pos);
                count++;
            }
        }
        if (count > 0) {
            avgPos.div(count);
        }
        if (avgPos.magSq() > 0) {
            let desired = p5.Vector.sub(avgPos, this.pos).setMag(Boid.MAX_VELOCITY).limit(Boid.MAX_FORCE).mult(Boid.COHESION);
            this.acceleration.add(desired);
        }
    }

    /**
     * Applies 'separation' force, which makes the boid want to move away 
     * from nearby boids within neighbors.
     * @param {Boid[]} neighbors a list of neighboring boids
     */
    applySeparation(neighbors) {
        let avgDiffs = createVector(0, 0);
        let count = 0;
        for (const n of neighbors) {
            if (n !== this) {
                let d = p5.Vector.sub(this.pos, n.pos);
                let dmag = d.mag();
                if (dmag > 0 && dmag <= Boid.SEP_DIST) {
                    d.setMag(1 / dmag);
                    avgDiffs.add(d);
                    count++;
                }
            }
        }
        if (count > 0) {
            avgDiffs.div(count);
        }
        if (avgDiffs.magSq() > 0) {
            let desired = avgDiffs.setMag(Boid.MAX_VELOCITY).sub(this.vel).limit(Boid.MAX_FORCE).mult(Boid.SEPARATION);
            this.acceleration.add(desired);
        }
    }

    /**
     * Applies the 'alignment' force, which makes the boid want to match
     * velocity (speed + heading) with those in neighbors.
     * @param {Boid[]} neighbors a list of neighboring boids
     */
    applyAlignment(neighbors) {
        let avgVel = createVector(0, 0);
        let count = 0;
        for (const n of neighbors) {
            if (n !== this) {
                avgVel.add(n.vel);
                count++;
            }
        }
        if (count > 0) {
            avgVel.div(count);
        }
        if (avgVel.magSq() > 0) {
            avgVel.setMag(Boid.MAX_VELOCITY).sub(this.vel).limit(Boid.MAX_FORCE).mult(Boid.ALIGNMENT);
            this.acceleration.add(avgVel);
        }
    }

    /**
     * Applies 'avoidance', which makes the boid move away from the point (x,y) 
     * if that point is within a certain distance.
     * @param {number} x x-coord of location to avoid
     * @param {number} y y-coord of location to avoid
     */
    applyAvoidance(x, y) {
        let d = createVector(this.pos.x - x, this.pos.y - y);
        if (d.mag() <= Boid.AVOID_DIST) {
            d.setMag(Boid.MAX_VELOCITY).limit(Boid.MAX_FORCE).mult(Boid.AVOID);
            this.acceleration.add(d);
        }
    }

    /** Applies 'wander', which causes adds some randomness to the boid's movement. */
    applyWander() {
        let desired = p5.Vector.fromAngle(this.vel.heading() + random(-PI / 2, PI / 2), Boid.MAX_VELOCITY);
        desired.sub(this.vel).limit(Boid.MAX_FORCE).mult(Boid.WANDER);
        this.acceleration.add(desired);
    }
}