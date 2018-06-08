class Asteroid {
    static get MAX_SPEED() { return 16; } // pixels/frame

    /**
     * Creates an asteroid
     * @param {p5.Vector} pos screen position
     * @param {number} dir direction as an angle/heading
     * @param {number} radius size of asteroid
     */
    constructor(pos, dir, radius = 64) {
        this.pos = pos;
        this.vel = p5.Vector.fromAngle(dir, Asteroid.MAX_SPEED / radius + random());

        this.radius = radius;
        this.col = color(75, 54, 33);

        this.life = radius / 16;
        this.isAlive = true;

        /**
         * vertices of asteroid shape
         * @type {p5.Vector[]}
         */
        this.verts = [];
        let n = 10;//floor(random(this.radius * 0.3, this.radius));
        if (this.radius <= 16) {
            n = 6; // lower detail for smaller ones
        }
        for (let i = 0; i < n; i++) {
            let v = p5.Vector.fromAngle(
                i / n * TWO_PI,
                this.radius + random(-0.25 * this.radius, 0.25 * this.radius));
            this.verts.push(v);
        }
        this.verts.push(this.verts[0].copy());
    }

    /**
     * Decreases life of the asteroid by dmg, updates alive/dead state,
     * and spawns new asteroids if dead.
     * @param {number} dmg amount of damage to apply
     * @returns {Asteroid[]} new asteroids, or empty array
     */
    applyDamage(dmg) {
        this.life -= dmg;
        let frags = [];
        if (this.life <= 0) {
            this.isAlive = false;
            // split into 2
            if (this.radius > 8) { // don't want them getting smaller than 8!
                for (let i = 0; i < 2; i++) {
                    frags.push(new Asteroid(
                        this.pos.copy(),
                        this.vel.copy().rotate(random(-PI, PI)).heading(),
                        this.radius / 2
                        // starting with 64 will produce: 64,32,16,8.
                    ));
                }
            }
        }
        return frags;
    }

    /**
     * Updates the asteroid's position according to its velocity. Wraps screen.
     */
    update() {
        // move
        this.pos.add(this.vel);
        // wrap screen
        const margin = 100;
        if (this.pos.x < -margin) { this.pos.x = width + margin; }
        else if (this.pos.x > width + margin) { this.pos.x = -margin; }
        if (this.pos.y < -margin) { this.pos.y = height + margin; }
        else if (this.pos.y > height + margin) { this.pos.y = -margin; }
    }

    /**
     * Draws the asteroid on the screen.
     */
    draw() {
        push();
        // noFill();
        fill(this.col); // used when drawing asteroids with triangles.
        stroke(this.col);
        translate(this.pos);
        for (let i = 0; i < this.verts.length - 1; i++) {
            // line(
            //     this.verts[i].x, this.verts[i].y,
            //     this.verts[i + 1].x, this.verts[i + 1].y);
            triangle(
                0, 0,
                this.verts[i].x, this.verts[i].y,
                this.verts[i + 1].x, this.verts[i + 1].y);
        }

        // display hit circle
        // noFill();
        // stroke(0, 0, 255);
        // ellipse(0, 0, this.radius * 2);

        pop();
    }

    /**
     * Creates new asteroids off screen at a random position around the edge.
     * @param {number} num how many to make
     * @param {number} radius size to make them (if undefined, will use
     * Asteroid's constructor default.)
     * @returns {Asteroid[]} the new asteroids
     */
    static Generate(num = 1, radius = undefined) {
        let roids = [];
        for (; num > 0; num--) {
            let aim = createVector(-width / 2, -height / 2);
            aim.rotate(random(0, TWO_PI));
            let a = new Asteroid(aim.copy().mult(1.1).add(width / 2, height / 2), aim.heading(), radius);
            roids.push(a);
        }
        return roids;
    }
}