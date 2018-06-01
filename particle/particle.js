class Particle {
    static get MaxLifespan() { return 255; }

    constructor(xstart, ystart, vel, radius = 10, col = 'white', lifespan = Particle.MaxLifespan) {
        this.pos = createVector(xstart, ystart);
        if (vel) {
            this.vel = vel;
        } else {
            this.vel = createVector(random(-2, 2), random(-2, 2));
        }
        this.radius = radius;
        this.col = col;

        this.lifespan = random(10, lifespan);
        this._updateAlpha();
    }

    isAlive() { return this.lifespan > 0; }

    _updateAlpha() {
        this.col.setAlpha(map(this.lifespan, 0, Particle.MaxLifespan, 0, 255));
    }

    update() {
        if (this.isAlive()) {
            this.pos.add(this.vel);
            this.lifespan--;
            this._updateAlpha();
        }
        return this;
    }

    draw() {
        if (this.isAlive()) {
            push();
            noStroke();
            fill(this.col);
            ellipse(this.pos.x, this.pos.y, this.radius * 2);
            pop();
        }
    }

    reuse(x, y) {
        this.pos.set(x, y);
        this.lifespan = Particle.MaxLifespan;
        this._updateAlpha();
    }

}

class Generator {
    constructor(startx, starty, rate = 1, max = 300, velFn = undefined, radiusFn = undefined, colFn = undefined) {
        this.pos = createVector(startx, starty);
        this.rate = rate; //particles per frame
        this.max = max;
        this.particles = [];
        this.active = true;

        if (velFn) { this.velFn = velFn; }
        else { this.velFn = () => createVector(random(-2, 2), random(-2, 2)); }

        if (radiusFn) { this.radiusFn = radiusFn; }
        else { this.radiusFn = () => random(5, 10); }

        if (colFn) { this.colFn = colFn; }
        else { this.colFn = () => color(random(255), random(255), random(255)); }
    }

    finish() {
        this.active = false;
    }

    activate() {
        this.active = true;
    }

    isFinished() {
        return 0 == this.particles.reduce((acc, p) => {
            if (p.isAlive()) { return acc + 1; } else { return acc; }
        }, 0);
    }

    _addParticle(num = 1) {
        for (let i = 0; i < num; i++) {
            this.particles.push(new Particle(this.pos.x, this.pos.y,
                this.velFn(),
                this.radiusFn(),
                this.colFn()
            ));
        }
    }

    update(x, y) {
        if (x != undefined && y != undefined) {
            this.pos.set(x, y);
        }

        // update all particles
        this.particles.forEach(p => p.update());

        if (this.active) {
            // calc num to emit this round
            let emit = this.rate;

            // start by reusing old particles
            for (const p of this.particles) {
                if (!p.isAlive()) {
                    p.reuse(this.pos.x, this.pos.y);
                    emit--;
                }
                if (emit == 0) { break; }
            }
            // add remaining particles by creating new ones
            this._addParticle(min(emit, this.max - this.particles.length));
        }
        return this;
    }

    draw() {
        this.particles.forEach(p => p.draw());
    }
}