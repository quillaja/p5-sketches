// This sketch creates "snakes" which seak a target such as food or 
// the player's mouse/finger using simple inverse kinematics. When the snake 
// intersects food, the snake grows longer.
//
// last edited: 2018-06-02

const MOUSE = "mouse";
const FOOD = "food";

let snakes = [];
let food = null;
let whichTarget = FOOD;

function setup() {
    // setup number of snakes, using a random number by default or 
    // allow user to enter an url param of "number".
    let params = getURLParams();
    let numSnakes = random(10, 20);
    if (params.number) {
        numSnakes = params.number;
    }

    createCanvas(windowWidth, windowHeight - 5);
    colorMode(HSB);

    for (let i = 0; i < numSnakes; i++) {
        let snake = new Snake(1, 10);
        snake.head.pos = createVector(random(width), random(height));
        snakes.push(snake);
    }

    food = new Food();
}

function draw() {
    // snake's target
    let target = null;
    if (whichTarget == MOUSE) {
        target = createVector(mouseX, mouseY); // make snakes chase mouse
    } else if (whichTarget == FOOD) {
        target = food.pos; // make snakes chase food
    }

    for (const snake of snakes) {

        // test snake-food intersection
        // grow the first snake that gets the food, then create new food.
        if (snake.headPosition.dist(food.pos) < food.size / 2) {
            snake.grow(food.col, food.size);
            food = new Food();
        }

        // update snake's target
        snake.update(target);
    }

    // draw
    clear();
    background(color(0, 0, 20));
    text("targeting " + whichTarget, 10, 16);
    text("click to change target.", 10, 32);

    for (const snake of snakes) {
        snake.draw();
    }
    food.draw();

}

function mouseClicked() {
    if (whichTarget == FOOD) { whichTarget = MOUSE; }
    else if (whichTarget == MOUSE) { whichTarget = FOOD; }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - 5);
}

/** 
 * Food basically houses parameters for growing the 'snake' when the 
 * player interacts with it. 
 */
class Food {
    /** Make a random food. */
    constructor() {
        this.pos = createVector(random(0, width), random(0, height));
        this.col = color(random(360), 100, 100);
        this.size = random(10, 25);
    }

    /** Draws the food to screen. */
    draw() {
        strokeWeight(0);
        fill(this.col);
        ellipse(this.pos.x, this.pos.y, this.size);
    }
}