let diffuse = 0.5; // 0 = pure specular, 1 = very diffuse
let slider = null;

function setup() {
    createCanvas(windowWidth, windowHeight - 40);
    // frameRate(1);
    slider = document.getElementById("diffuseSlider");
    slider.value = diffuse;
}

let bounces = [];
let maxBounces = 10;

function draw() {
    background(50);

    const xo = width / 2;
    const yo = height;
    // const o = createVector(xo, yo);
    scale(1, -1);
    translate(xo, -yo);

    diffuse = slider.value;
    document.getElementById("diffuseLabel").textContent = Number(diffuse).toFixed(2);

    let mouse = createVector(mouseX - xo, yo - mouseY);
    let pureBounce = createVector(-mouse.x, mouse.y); // special case with these axes
    let randDir = p5.Vector.fromAngle(random(0, PI), mouse.mag());
    let lerpAmount = diffuse * random();
    let finalBounce = p5.Vector.lerp(pureBounce, randDir, lerpAmount).setMag(mouse.mag());

    if (bounces.length > maxBounces) {
        bounces = bounces.slice(1);
    }
    bounces.push(finalBounce);

    stroke(255);
    line(0, 0, mouse.x, mouse.y);
    line(0, 0, pureBounce.x, pureBounce.y);
    stroke(255, 0, 0);
    line(0, 0, randDir.x, randDir.y);

    for (let i = 0; i < bounces.length; i++) {
        let b = bounces[i];
        stroke(0, 255, 0, 255 * (i + 1) / bounces.length);
        line(0, 0, b.x, b.y);
    }


    // axes
    stroke(255, 255, 0);
    line(0, 0, 25, 0);
    stroke(0, 0, 255);
    line(0, 0, 0, 25)

}