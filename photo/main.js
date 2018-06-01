// Loads a random image from the API at "https://picsum.photos/" and
// displays it on the screen with a splotchy painterly effect.
//
// last modified 2018-05-30

var pic = null;
var picsize = 0;
const speed = 25;
var go = false;

function setup() {
    const bg = 255;
    const txt = 0;
    picsize = min(windowWidth, windowHeight);
    createCanvas(picsize, picsize);

    background(bg);
    fill(txt);
    textAlign(CENTER, CENTER);
    textSize(48);
    text("Loading image", width / 2, height / 2);

    pic = loadImage(`https://picsum.photos/${picsize}?random`,
        () => { background(bg); go = true; loop(); },
        () => { background(bg); text("Error loading image.\nPress F5 to refresh.", width / 2, height / 2); }
    );

    noLoop();
}

function draw() {
    if (go) {
        const frms = 60 * 4; // 60 fps * 4 sec = 240 frames
        const d = map(constrain(frameCount, 0, frms), 0, frms, picsize * 0.1, picsize * 0.01);
        noStroke();
        for (let i = 0; i < speed; i++) {
            let x = random(width);
            let y = random(height);
            fill(pic.get(x, y));
            ellipse(x, y, d);
        }
    }
}

function mouseClicked() {
    if (go) {
        go = false;
        noLoop();
        image(pic, 0, 0);
    } else {
        go = true;
        loop();
    }
}