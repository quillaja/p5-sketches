class Bullet {
    static get SPEED() { return 10; }//px/frame

    /**
     * Creates a bullet
     * @param {p5.Vector} pos screen position
     * @param {number} dir heading/direction as an angle (radians)
     */
    constructor(pos, dir, power = 1) {
        this.pos = pos;
        this.vel = p5.Vector.fromAngle(dir, Bullet.SPEED);

        this.radius = 3;
        this.col = color(255, 0, 0);

        this.isAlive = true;

        this.power = power; // damage power
    }

    /**
     * Updates the bullet's position using velocity. Kills the bullet
     * if it leaves the screen.
     */
    update() {
        // move
        this.pos.add(this.vel);

        // deal with screen edges
        if (this.pos.x < 0 || this.pos.x > width) { this.isAlive = false; }
        if (this.pos.y < 0 || this.pos.y > height) { this.isAlive = false; }
    }

    /**
     * Draws the bullet on the screen.
     */
    draw() {
        push();
        noStroke();
        fill(this.col);
        translate(this.pos);
        ellipse(0, 0, this.radius * 2);
        pop();
    }
}

// doc for callback used in Weapon
/**
 * Callback for generating bullets.
 * @callback bulletGenerator
 * @param {p5.Vector} pos position of ship. you should copy() this.
 * @param {number} dir ship's heading
 * @returns {Bullet[]} a list of new Bullets
 */

/**
 * a weapon
 */
class Weapon {

    /**
     * Make a new Weapon
     * @param {string} name name of the weapon
     * @param {number} reloadTime num frames weapon must 'cool down'
     * @param {bulletGenerator} genBullet function to generate bullets given a position and ship's heading
     */
    constructor(name, reloadTime, genBullet) {
        this.name = name;

        this.reloadTime = reloadTime;
        this.reloadRemaining = 0;

        this.generate = genBullet;
    }

    /**
     * Reduce the reload remaining counter.
     * @param {number} num how much to reduce the reloadRemaining counter by
     */
    reduceReload(num = 1) { this.reloadRemaining -= num; }

    /**
     * @returns true if the weapon can fire
     */
    get canFire() { return this.reloadRemaining <= 0; }

    /**
     * Generates bullets, modifies reload remaining times.
     * @param {Ship} ship reference to the ship
     * @returns {Bullet[]} generated bullets
     */
    fire(ship) {
        this.reloadRemaining = this.reloadTime;
        return this.generate(ship.pos, ship.dir);
    }
}

/**
 * A list of weapons for the ship to use.
 * @type {Weapon[]} da weapons
 */
let arsenal = [

    new Weapon(
        "Blaster", 12, (p, d) => {
            return [new Bullet(p.copy(), d)];
        }
    ),

    new Weapon(
        "Speed blaster", 5, (p, d) => {
            return [new Bullet(p.copy(), d)];
        }
    ),

    new Weapon(
        "Tri-beam", 21, (p, d) => {
            let bullets = [];
            for (let i = -1; i < 2; i++) {
                let b = new Bullet(p.copy(), d + i * PI / 8);
                b.col = color(0, 255, 0);
                bullets.push(b);
            }
            return bullets;
        }
    ),

    new Weapon(
        "Bertha", 30, (p, d) => {
            let b = new Bullet(p.copy(), d, 5);
            b.radius = 40;
            return [b];
        }
    ),

    new Weapon(
        "Mine", 10, (p, d) => {
            let b = new Bullet(p.copy(), d);
            b.vel.x = 0;
            b.vel.y = 0;
            b.col = color(255, 125, 16);
            return [b];
        }
    ),

    new Weapon(
        "Omni-blaster", 40, (p, d) => {
            let bullets = [];
            for (let i = 0; i < 10; i++) {
                let b = new Bullet(p.copy(), d + i * TWO_PI / 10);
                b.col = color(255, 0, 255);
                bullets.push(b);
            }
            return bullets;
        }
    )
];