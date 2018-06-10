class Ship {
    static get MAX_SPEED() { return 3; } // pixels/frame
    static get SPEED() { return 0.1; } //pixels/frame
    static get TURN_SPEED() { return 0.05; } // about PI/60 radians/frame
    static get WEAPON_SWITCH_TIME() { return 30; } // frames
    static get INVULNERABLE_TIME() { return 100; } // frames
    static get FULL_SHIELD() { return 100; }

    /**
     * Creates a ship.
     */
    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.vel = createVector(0, 0);
        this.dir = 0;

        this.radius = 10;

        this.col = color(255);

        this.isAlive = true;
        this.shields = 100;
        this.score = 0;
        this.invulnerable = 0;
        this.invulnerableColor = color(255, 255, 0);
        this.isGod = false;

        this.weaponIndex = 0;
        this.weapon = arsenal[this.weaponIndex];
        this.weaponSwitchWait = Ship.WEAPON_SWITCH_TIME;

        /**
         * the ship keeps the list of bullets it fired.
         * @type {Bullet[]}
         */
        this.bullets = [];

    }

    /**
     * True if the ship is in temporary invulnerability mode (after being hit).
     * @returns {boolean} true if invulnerable
     */
    get isInvulnerable() { return this.invulnerable > 0 || this.isGod; }

    /**
     * @returns True if the ship can switch weapons.
     */
    get canSwitchWeapon() { return this.weaponSwitchWait <= 0; }

    /**
     * Reduces ship's shield (life). Controls alive/dead state, as well as 
     * sets temporary invulnerability after being hit.
     * @param {number} dmg the amount of damage
     */
    applyDamage(dmg) {
        if (!this.isInvulnerable) {
            this.shields -= dmg;
            this.invulnerable = Ship.INVULNERABLE_TIME;
            if (this.shields <= 0) {
                this.isAlive = false;
            }
        }
    }

    /**
     * Updates the ship's position, wraps screen. Reads keyboard for controls. 
     * Updates gun reload and invulnerabilty counters. Refills shield every 
     * 100 points scored.
     */
    update() {
        // refill shields every 100 points
        if (this.score > 0 && this.score % 100 == 0) {
            this.shields = Ship.FULL_SHIELD;
        }

        // alter reload
        this.weapon.reduceReload();
        this.weaponSwitchWait--;
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
            if (this.weapon.canFire) {
                // fire
                // let b = new Bullet(this.pos.copy(), this.dir);
                // this.bullets.push(b);
                // this.reload = Ship.RELOAD_TIME;
                this.bullets.push(...this.weapon.fire(this));
            }
        }
        if (this.canSwitchWeapon) {
            if (keyIsDown(88)) { // X
                this.weaponIndex++;
                if (this.weaponIndex >= arsenal.length) {
                    this.weaponIndex = 0;
                }
                this.weapon = arsenal[this.weaponIndex];
                this.weaponSwitchWait = Ship.WEAPON_SWITCH_TIME;
            }
            if (keyIsDown(90)) { // Z
                this.weaponIndex--;
                if (this.weaponIndex < 0) {
                    this.weaponIndex = arsenal.length - 1;
                }
                this.weapon = arsenal[this.weaponIndex];
                this.weaponSwitchWait = Ship.WEAPON_SWITCH_TIME;
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

    /**
     * Draws the ship to the screen, and also draws the shield and score HUD.
     */
    draw() {
        push();
        noStroke();
        if (this.isInvulnerable) {
            fill(this.invulnerableColor);
        } else {
            fill(this.col);
        }
        translate(this.pos);
        rotate(this.dir);
        triangle(16, 0, -6, 5, -6, -5);

        // display hit circle
        // noFill();
        // stroke(0, 0, 255);
        // ellipse(0, 0, this.radius * 2);

        // shield display
        // unrotate and untranslate back to normal coords.
        rotate(-this.dir);
        translate(-this.pos.x, -this.pos.y);
        fill(255, 0, 0);
        rect(5, 5, this.shields, 20);
        noFill();
        stroke(255);
        rect(5, 5, 100, 20);
        textAlign(LEFT, TOP);

        // textFont('monospace');
        textSize(14);
        fill(255);
        text("Shield", 7, 9);//6, 5);
        text(`Score: ${this.score}`, 7, 30);//5, 24);
        text(`Weapon: ${this.weapon.name}`, 7, 50); //5, 40);

        pop();
    }
}
