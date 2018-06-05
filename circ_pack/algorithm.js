// Circle/shape packing based on paper written by Paul Bourke.
//
// Title: "Space Filling: A new algorithm for procedural creation of game assets".
// Link: http://www.paulbourke.net/papers/cgat2013/paper.pdf
//
// Written 2018-06 by Ben (https://github.com/quillaja)

/**
 * This is the main part of the actual algorith.
 * If we haven't given up on trying to pack in more shapes, we're going
 * to try "maxAttempts" to generate a shape that is of the desired area
 * (determined by g(i) func), is within the bounding shape, and does
 * not intersect any other shapes.
 */
function pack() {

    // if found (ok==true), add the shape to the list of shapes and break
    // out of the loop. Otherwise, keep trying.
    if (!gaveUp) {
        let attempts = 0;
        let success = false;

        // try adding a shape
        while (attempts < maxAttempts) {
            let [ok, s] = packingType.Generate(shapes, boundingShape.area * percArea, boundingShape);
            if (ok) {
                shapes.push(s);
                success = true;
                break;
            }
            attempts++;
        }
        // if the success variable is not true, that means we've exhausted
        // our maximum number of attempts to pack a shape. Then we want to
        // give up trying to pack more shapes. (but keep drawing in draw()).
        if (!success) {
            let msg = `DONE: ${maxAttempts} attempts yielded no valid shape. Total shapes: ${shapes.length}.`;
            showInfo(msg);
            console.log(msg);
            // can't use noLoop() or we can't alter the view anymore
            gaveUp = true;
        }
        // if the parameters for the algorithm are correct, we could produce
        // so many (up to infinity) shapes that drawing them etc requires so
        // much processing that performance becomes terrible. Therefore, if we
        // produce over a certain number of shapes, we 'give up'.
        if (shapes.length >= default_maxShapes) {
            let msg = `DONE: Max of ${default_maxShapes} shapes were produced.`;
            showInfo(msg);
            console.log(msg);
            gaveUp = true;
        }
    }
}

/**
 * Riemann Zeta function.
 * @param {number} coefficient power to which i will be raised
 * @returns a function g(i) = 1 / i^coefficient
 */
function sequence(coefficient) {
    return i => {
        if (i == 0) {
            return 1;
        } else {
            return 1 / Math.pow(i, coefficient);
        }
    }
}

/**
 * Calculates the radius of a circle having the given area.
 * @param {number} area the area of the circle
 * @returns the radius
 */
function circAtoR(area) {
    return Math.sqrt(area / Math.PI);
}
