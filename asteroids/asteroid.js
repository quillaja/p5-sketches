class Asteroid {
    static get MAX_SPEED() { return 16; } // pixels/frame

    constructor(pos, dir, radius = 64) {
        this.pos = pos;
        this.vel = p5.Vector.fromAngle(dir, Asteroid.MAX_SPEED / radius + random());

        this.radius = radius;
        this.col = color(255);//color(75,54,33);

        this.life = radius / 16;
        this.isAlive = true;

        this.verts = [];
        let n = 16;//floor(random(this.radius * 0.3, this.radius));
        for (let i = 0; i < n; i++) {
            let v = p5.Vector.fromAngle(
                i / n * TWO_PI,
                this.radius + random(-0.15 * this.radius, 0.15 * this.radius));
            this.verts.push(v);
        }
        this.verts.push(this.verts[0].copy());
    }

    applyDamage(dmg) {
        this.life -= dmg;
        let frags = [];
        if (this.life <= 0) {
            this.isAlive = false;
            if (this.radius > 8) {
                for (let i = 0; i < 2; i++) {
                    frags.push(new Asteroid(
                        this.pos.copy(),
                        this.vel.copy().rotate(random(-PI, PI)).heading(),
                        this.radius / 2
                    ));
                }
            }
        }
        return frags;
    }

    update() {
        // check life
        // if life <= 0, split into smaller asteroids IF radius > some number


        // move
        this.pos.add(this.vel);
        // wrap screen
        if (this.pos.x < -100) { this.pos.x = width + 100; }
        else if (this.pos.x > width + 100) { this.pos.x = -100; }
        if (this.pos.y < -100) { this.pos.y = height + 100; }
        else if (this.pos.y > height + 100) { this.pos.y = -100; }
    }

    draw() {
        push();
        noFill();
        stroke(this.col);
        translate(this.pos);
        for (let i = 0; i < this.verts.length - 1; i++) {
            line(
                this.verts[i].x, this.verts[i].y,
                this.verts[i + 1].x, this.verts[i + 1].y);
        }

        // display hit circle
        // noFill();
        // stroke(0, 0, 255);
        // ellipse(0, 0, this.radius * 2);

        pop();
    }

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