class Ship {
    static get MAX_SPEED() { return 3; } // pixels/frame
    static get SPEED() { return 0.1; } //pixels/frame
    static get TURN_SPEED() { return 0.05; } // about PI/60 radians/frame
    static get RELOAD_TIME() { return 12; } // frames
    static get INVULNERABLE_TIME() { return 100; } // frames

    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.vel = createVector(0, 0);
        this.dir = 0;

        this.radius = 10;

        this.col = color(255);

        this.isAlive = true;
        this.shields = 100;
        this.reload = 0;
        this.invulnerable = 0;

        this.bullets = [];

        this.score = 0;
    }

    get isInvulnerable() { return this.invulnerable > 0; }

    applyDamage(dmg) {
        if (!this.isInvulnerable) {
            this.shields -= dmg;
            this.invulnerable = Ship.INVULNERABLE_TIME;
            if (this.shields <= 0) {
                this.isAlive = false;
            }
        }
    }

    update() {
        // check shield amount

        // alter reload
        this.reload--;
        // alter invulnerability (post hit)
        if (this.isInvulnerable) {
            this.invulnerable--;
        }

        // check keys pressed (up, down?, left, right, space)
        let f = 0;
        let r = 0;
        if (keyIsDown(UP_ARROW)) {
            f += Ship.SPEED;
        }
        // if (keyIsDown(DOWN_ARROW)) {
        //     f -= Ship.SPEED;
        // }
        if (keyIsDown(LEFT_ARROW)) {
            r -= Ship.TURN_SPEED;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            r += Ship.TURN_SPEED;
        }
        if (keyIsDown(32)) { // SPACE
            // if 'reload' time ok, fire bullet. else nothing.
            if (this.reload <= 0) {
                // fire
                let b = new Bullet(this.pos.copy(), this.dir);
                this.bullets.push(b);
                this.reload = Ship.RELOAD_TIME;
            }
        }
        // apply changes to ship (force, rotation), limit vel
        this.dir += r; // change ship direction
        this.vel.add(p5.Vector.fromAngle(this.dir, f));
        this.vel.limit(Ship.MAX_SPEED);
        this.vel.mult(0.995); //tiny bit of dampening
        // move ship
        this.pos.add(this.vel);
        // wrap screen
        if (this.pos.x < 0) { this.pos.x = width; }
        else if (this.pos.x > width) { this.pos.x = 0; }
        if (this.pos.y < 0) { this.pos.y = height; }
        else if (this.pos.y > height) { this.pos.y = 0; }
    }

    draw() {
        push();
        noStroke();
        fill(this.col);
        if (this.isInvulnerable) {
            fill(color(255, 255, 0));
        }
        translate(this.pos);
        rotate(this.dir);
        triangle(16, 0, -6, 5, -6, -5);

        // display hit circle
        // noFill();
        // stroke(0, 0, 255);
        // ellipse(0, 0, this.radius * 2);

        //shield display
        rotate(-this.dir);
        translate(-this.pos.x, -this.pos.y);
        noStroke();
        fill(color(255, 0, 0));
        rect(5, 5, this.shields, 20);
        noFill();
        stroke(255);
        rect(5, 5, 100, 20);
        textAlign(LEFT, TOP);

        textFont('monospace');
        textSize(16);
        fill(255);
        text("Shield", 6, 5);
        text(`Score: ${this.score}`, 5, 24);
        pop();
    }
}

class Bullet {
    static get SPEED() { return 10; }//px/frame

    constructor(pos, dir) {
        this.pos = pos;
        this.vel = p5.Vector.fromAngle(dir, Bullet.SPEED);

        this.radius = 3;
        this.col = color(255, 0, 0);

        this.isAlive = true;
    }

    update() {
        // move
        this.pos.add(this.vel);

        // wrap screen
        if (this.pos.x < 0 || this.pos.x > width) { this.isAlive = false; }
        if (this.pos.y < 0 || this.pos.y > height) { this.isAlive = false; }
    }

    draw() {
        push();
        noStroke();
        fill(this.col);
        translate(this.pos);
        ellipse(0, 0, this.radius * 2);
        pop();
    }
}