import {
    BlobI,
    CircleI,
    EyeData,
    GrowingTexturedLine,
    GrowingTexturedLineShape,
    HeadData,
    LineI,
    MaskShape,
    MouthApprox,
    MouthApproxShape,
    ShapeItem,
    SteppedColorLineShape,
    SvgPolygon,
    TwoEye,
    UnionShape
} from "./shapes.js";
import {fbm} from "./util.js";
import {
    getBodyPart,
    getLightLanguageCharacter,
    getLightLanguageCharacterIds,
    mouthOvalPoints,
    mouthPoints
} from "./data";
import P5 from 'p5'
import {angleModes, eyeModes, lineModes} from "./features";

const borderGlobal = 10;
export const genCircle = (p5) => {
    const x = p5.sb.random(p5.width / 2);
    const y = p5.sb.random(p5.height);
    const radius = p5.sb.random(p5.width * 0.1);
    return new CircleI({points: [x, y], radius});
};

export const insertLinePoint = (world, shape, i) => {
    const line = shape.line;
    const item = new ShapeItem();
    item.x = line.points[i];
    item.y = line.points[i + 1];
    item.width = line.weight;
    item.height = line.weight;
    item.idx = i;
    item.shape = shape;
    // world.quadtree.push(item);
};

export const genLine = (p5, world) => {
    const weight = 8; //Math.pow(p5.sb.random() + 1, p5.sb.random(0, 3));
    const border = borderGlobal + weight / 2;
    p5.push();
    let x = p5.sb.random(border, p5.width / 2);
    let y = p5.sb.random(border, p5.height);
    const len = 1000; //p5.sb.random(200);

    const capsR = 2; //Math.floor(p5.sb.random(0, 3));
    const caps = [p5.MITER, p5.BEVEL, p5.ROUND][capsR];
    const line = [x, y];
    const noiseDet = [p5.sb.random(0.01, 0.6), p5.sb.random(1, 2)];
    p5.noiseDetail(noiseDet[0], noiseDet[1]);
    const scaleX = weight; //weight * 0.25; //p5.sb.random(1, 50);
    const scaleY = weight; //weight * 0.25; //p5.sb.random(1, 50);
    let nx = p5.sb.random(0.1, 5);
    let ny = p5.sb.random(0.1, 5);
    const noiseStep = 0.01;

    const out = new LineI({
        points: line,
        weight,
        noiseDetail: [0.1, 2],
        cap: caps,
    });

    // let numCollisions = 0;
    for (let i = 0; i < len; i++) {
        const x1 = p5.noise(nx) - p5.noise(nx * 2);
        const y1 = p5.noise(ny) - p5.noise(ny * 2);
        //
        //   let collisionShapeItem;
        //   for (let j = 1; j < 5; j++) {
        //     const jf = j / 5;
        //     const tx = x + x1 * scaleX * jf;
        //     const ty = x + y1 * scaleY * jf;
        //     const col = t.colliding(
        //         { x: tx, y: ty, width: weight, height: weight }
        //         // function (element1, element2) {
        //         //   return (
        //         //     p5.dist(element1.x, element1.y, element2.x, element2.y) <
        //         //     element1.width + element2.width
        //         //   );
        //         // }
        //     );
        //     if (col.length) {
        //       collisionShapeItem = col[0]; //.find((c) => c.shape !== out); //|| i - c.idx > 10//|| i - c.idx > 20
        //       if (collisionShapeItem) {
        //         x = tx;
        //         y = ty;
        //         break;
        //       }
        //     }
        //   }
        //   if (!collisionShapeItem) {
        //     x = x + x1 * scaleX;
        //     y = y + y1 * scaleY;
        //   }
        //
        //   // validCol = col.find((c) => c.shape !== out || i - c.idx > 10);
        //   if (collisionShapeItem) {
        //     const a = new P5.Vector();
        //     a.x = x;
        //     a.y = y;
        //     const coli = collisionShapeItem;
        //     const bshape = (coli.shape as LineI).line;
        //     const bx = bshape.points[coli.idx];
        //     const by = bshape.points[coli.idx + 1];
        //     const b = new P5.Vector();
        //     b.x = bx;
        //     b.y = by;
        //     const origin = b.copy();
        //
        //     const angle = Math.acos(a.dot(b) / (a.mag() * b.mag()));
        //     let direction = 1;
        //     if (angle > Math.PI * 0.5) {
        //       direction = -1;
        //     }
        //     const nextpoints = coli.idx + 2 * direction;
        //     if (nextpoints >= 0 && nextpoints < bshape.points.length) {
        //       // //adjust for collision
        //       // const nbx = bshape.points[nextpoints];
        //       // const nby = bshape.points[nextpoints + 1];
        //       // // point b is the origin
        //       // a.x = b.x - a.x;
        //       // a.y = b.y - a.y;
        //       // b.x = nbx - b.x;
        //       // b.y = nby - b.y;
        //       // const rejection = P5.Vector.sub(
        //       //   a,
        //       //   P5.Vector.mult(b.normalize(), a.mag() * Math.cos(angle))
        //       // );
        //       // //normalize is messing this up i think
        //       // const point = rejection.normalize().mult(weight).add(origin);
        //       // x = point.x;
        //       // y = point.y;
        //
        //       const nbx = bshape.points[nextpoints];
        //       const nby = bshape.points[nextpoints + 1];
        //       // point b is the origin
        //       // a.x = b.x - a.x;
        //       // a.y = b.y - a.y;
        //       // b.x = nbx - b.x;
        //       // b.y = nby - b.y;
        //
        //       const corrected = P5.Vector.sub(a, b)
        //           .normalize()
        //           .mult(collisionShapeItem.width + weight)
        //           .add(b);
        //       // x = corrected.x;
        //       // y = corrected.y;
        //
        //       world.insertCollision(b.x, b.y);
        //       numCollisions++;
        //     }
        //   }
        //   if (collisionShapeItem) {
        //     break;
        //   }

        x += x1
        y += y1
        nx += noiseStep;
        ny += noiseStep;
        if (x < border) x = border;
        if (x > p5.width - border) x = p5.width - border;
        if (y < border) y = border;
        if (y > p5.height - border) y = p5.height - border;
        line.push(x, y);
        insertLinePoint(world, out, i + 1);
    }
    // console.log("collisions", numCollisions);
    p5.pop();
    return out;
};

export const genBlob = (p5) => {
    p5.push();
    const ox = p5.sb.random(p5.width / 2);
    const oy = p5.sb.random(p5.height);

    const minR = p5.sb.random(3, 10);
    const maxR = p5.sb.random(minR, 150);

    const points = [];
    const noiseDet = [p5.sb.random(1, 1), p5.sb.random(0.01, 0.1)];
    p5.noiseDetail(noiseDet[0], noiseDet[1]);
    const detail = p5.sb.random(300, 360 * 4);
    let nv = p5.sb.random(0.1, 1);
    const noiseStep = 0.0001; //p5.sb.random(0.01, 0.04);
    // let minx,
    //   miny,
    //   maxx,
    //   maxy: number | undefined = undefined;
    for (let i = 0; i < detail; i++) {
        const a = (i / detail) * p5.TWO_PI;
        const nr = fbm(
            p5,
            p5.createVector(p5.cos(a + nv), p5.sin(a + nv)).mult(p5.TWO_PI)
        );
        const r = (maxR - minR) * nr + minR;
        let x = p5.cos(a) * r + ox;
        let y = p5.sin(a) * r + oy;
        nv += noiseStep;
        // if (x < minx || minx === undefined) minx = x;
        // if (x > maxx || maxx === undefined) maxx = x;
        // if (y < miny || miny === undefined) miny = y;
        // if (y > maxy || maxy === undefined) maxy = y;
        if (x < borderGlobal) x = borderGlobal;
        if (x > p5.width - borderGlobal) x = p5.width - borderGlobal;
        if (y < borderGlobal) y = borderGlobal;
        if (y > p5.height - borderGlobal) y = p5.height - borderGlobal;
        points.push(x, y);
    }

    p5.pop();
    return new BlobI({
        points: points,
    });
};

export const genEye = (p5, world) => {
    let genFunc;
    if (world.features.eyes(eyeModes.hypnotizedWavy)) {
        genFunc = genEye2;
    } else if (world.features.eyes(eyeModes.hypnotizedCircles)) {
        genFunc = genEye1
    } else if (world.features.eyes(eyeModes.mask)) {
        genFunc = genEyeMask
    }
    return genFunc(p5, world)
}
export const genEye1 = (p5, world) => {
    //
    const data = new EyeData();
    data.radius = p5.sb.random(p5.width * .1, p5.width * .2);
    data.position = p5.createVector();
    data.position.x = p5.sb.random(data.radius, p5.width * .5 - data.radius);
    data.position.y = p5.sb.random(p5.height * .2 + data.radius, p5.height * .7 - data.radius);//, p5.height*.9-data.radius);
    data.pupilRadius = p5.sb.random(data.radius * .1, data.radius * .2);
    // data.pupilRadius/data.radius
    data.irisRepeats = p5.sb.randomInt(10, 20)
    data.colorScheme = {
        eye: world.colorScheme.primary(),
        eyeIrus: world.colorScheme.primary({saturation: .8}),
        pupil: world.colorScheme.secondary()
    }

    const brow = genBrow(p5, world, data)
    data.browShape = brow;

    return new TwoEye(data)
}

export const genEyeMask = (p5, world) => {

    const eyeRadius = p5.sb.random(p5.width * .1, p5.width * .15);
    const eyePosition = p5.createVector();
    eyePosition.x = p5.width / 2
    eyePosition.y = p5.sb.random(p5.height * .2 + eyeRadius, p5.height * .7 - eyeRadius);//, p5.height*.9-data.radius);
    // const pupilRadius = eyeRadius * p5.sb.random(.1, .5);


    const data = new HeadData()
    data.colorScheme = {}
    data.colorScheme.fill = world.colorScheme.secondary();
    data.position = eyePosition;
    const wint = eyeRadius;
    const numInlays = p5.sb.randomInt(1, 10);
    const extraSpace = p5.sb.random(1, 3)
    const width = eyeRadius + eyeRadius / numInlays / ((numInlays * 2 * extraSpace))

    // line width
    data.width = width

    data.height = data.width / 2
    data.growingTexturedLines = [];
    const rad = eyeRadius;
    let addNextSection = p5.sb.random();
    const lineWidth = rad / (numInlays * 2 * extraSpace)
    data.pupilRadius = (1) / numInlays * rad;
    if (numInlays === 1) {
        data.radius = rad * 2
    } else {
        data.radius = rad + data.pupilRadius;//lineWidth * 2
    }


    // width += lineWidth;
    for (let i = 0; i < numInlays; i++) {
        const d = new GrowingTexturedLine();
        d.rotation = 0;//getRotationFromFeature(p5, world)
        d.origin = p5.createVector(p5.width / 2, data.position.y)
        d.width = lineWidth;
        d.growthFactor = 1;
        d.points = [];
        // small inner to big outer
        const radius = (1 - i / numInlays) * rad;
        const outerRadius = (i + 1) / numInlays * rad;
        let a = p5.HALF_PI
        const aStep = p5.HALF_PI / 50;
        while (a < p5.PI) {
            d.points.push(p5.cos(a) * radius, p5.sin(a) * radius)
            a += aStep;
        }
        a = p5.TWO_PI
        let end = 3 * p5.PI / 2;
        if (addNextSection < 1) {
            if (i === 0) {
                end = 0
            } else {
                end = p5.QUARTER_PI + p5.QUARTER_PI / (numInlays + 1) + rad * .0023 * (1 - (i + 1) / numInlays)
            }

            while (a > end) {
                d.points.push(p5.cos(a) * outerRadius - outerRadius - radius, p5.sin(a) * outerRadius)
                a -= aStep;
            }
            if (addNextSection < .25) {

            }
        }

        d.points.reverse()
        for (let j = 0, tmp = 0; j < d.points.length; j += 2) {
            tmp = d.points[j]
            d.points[j] = d.points[j + 1]
            d.points[j + 1] = tmp
        }

        d.showIndent = world.features.lineMode(lineModes.inlet)


        d.colorScheme = {
            colorsArray: []
        }
        let colIndex = 0;
        let randBypass = p5.sb.random();
        for (let i = 0; i < d.points.length / 2; i++) {
            if (p5.sb.random() < randBypass) {
                colIndex++;
                randBypass = p5.sb.random();
            }
            d.colorScheme.colorsArray.push(world.colorScheme.continuousStepped(colIndex))
        }
        data.growingTexturedLines.push(new SteppedColorLineShape(d))
    }
    data.growingTexturedLines.reverse()


    return new MaskShape(data)
}


export const genEye2 = (p5, world) => {
    //
    const data = new EyeData();
    data.radius = p5.sb.random(p5.width * .05, p5.width * .15);
    data.position = p5.createVector();
    data.position.x = p5.sb.random(data.radius, p5.width * .5 - data.radius);
    data.position.y = p5.sb.random(p5.height * .2 + data.radius, p5.height * .7 - data.radius);//, p5.height*.9-data.radius);
    data.pupilRadius = p5.sb.random(data.radius * .1, data.radius * .9);
    data.irisRepeats = p5.sb.randomInt(5, 10)
    data.tiltEyeVector = p5.createVector(p5.sb.random() - p5.sb.random(), p5.sb.random() - p5.sb.random())
    data.colorScheme = {
        eye: world.colorScheme.primary(),
        eyeIrus: world.colorScheme.primary({saturation: .5, brightness: .5}),
        pupil: world.colorScheme.secondary()
    }

    const eyePoints = [];
    const detail = 200;
    const minRadius = data.radius * .8
    const noiseDet = [p5.sb.random(1, 4), p5.sb.random(.1, 1)];
    const noiseStart = p5.sb.randomInt(0, 10000)
    p5.noiseDetail(noiseDet[0], noiseDet[1]);
    for (let i = 0; i < detail; i++) {
        const fi = i / detail;
        const a = fi * p5.TWO_PI;
        const r = p5.noise(noiseStart + a) * minRadius + data.radius * .2
        const x = p5.cos(a) * r;
        const y = p5.sin(a) * r;
        eyePoints.push(p5.createVector(x, y));
    }

    data.customEyeShape = eyePoints;

    const brow = genBrow(p5, world, data)
    data.browShape = brow;

    return new TwoEye(data)
}

export const genBrow = (p5, world, eyeData) => {

    const opts = {}
    opts.rotation = p5.PI * p5.sb.random(1.1, 1.4)
    opts.origin = eyeData.position.copy()

    if (opts.rotation < p5.PI * 1.3) {
        opts.origin.add(eyeData.radius * .5, -30)
    } else {
        opts.origin.add(eyeData.radius * .5, 0)
    }
    return genInlaidLine(p5, world, opts)
}


// use opts.rotqtion or opt.destination
export const genInlaidLine = (p5, world, opts) => {
    const {
        origin,
        rotation,
        width,
        destination,
        growthFactor,
        periods,
        waveWidth,
        doNotDuplicate,
        scale: scaleIn
    } = opts || {};
    if (scaleIn === 0) {
        throw new Error("scale cannot be 0")
    }
    const scale = scaleIn || 1;
    if (isFinite(rotation) && destination) {
        throw new Error("cannot have both rotation and destination")
    }
    const data = new GrowingTexturedLine();
    data.doNotDuplicate = doNotDuplicate

    if (rotation) {
        data.rotation = rotation
    } else if (destination) {
        data.rotation = p5.atan2(destination.y - origin.y, destination.x - origin.x)
    } else {
        data.rotation = getRotationFromFeature(p5, world)
        // if (world.features.angles(angleModes.instectoidAngry)) {
        //
        //     data.rotation = p5.PI * p5.sb.random(1.1, 1.4)
        // } else if (world.features.angles(angleModes.downwards)) {
        //     data.rotation = p5.PI * p5.sb.random(.5, .85)
        // } else {
        //     data.rotation = p5.PI * p5.sb.random(.95, 1.05)
        // }
    }

    data.origin = origin || p5.createVector(p5.sb.random() * p5.width * .75, p5.sb.random() * p5.height)

    data.endCap = true;

    data.points = [];

    data.width = width || p5.sb.random(p5.width * .001, p5.width * .02) * scale;
    data.growthFactor = isFinite(growthFactor) ? growthFactor : (p5.sb.random(0, .02) + 1)//* scale
    const length = destination ? P5.Vector.sub(destination, data.origin).mag() : data.origin.mag() * 1.3;//p5.sb.random(p5.width * .35, p5.width * .5);
    const numPoints = length / 5;
    const wavynessValue = isFinite(waveWidth) ? waveWidth : p5.sb.random(data.width * .1, data.width * 5);
    const periodsValue = isFinite(periods) ? periods : p5.sb.random(1, 3);
    data.colorScheme = {
        eye: world.colorScheme.primary()
    }
    for (let i = 0; i < numPoints; i++) {
        const fi = i / numPoints;
        data.points.push(fi * length, p5.sin(fi * periodsValue * p5.TWO_PI) * wavynessValue);
    }

    let colorPrimary = true;
    let inWidth = data.width;
    const smallerShapes = [];
    const numInlays = p5.sb.randomInt(3, 9);
    for (let i = 0; i < numInlays; i++) {
        const smaller = {...data}
        inWidth *= p5.sb.random(.3, .9);
        smaller.width = inWidth
        smaller.colorScheme = {...smaller.colorScheme}
        smaller.colorScheme.eye = colorPrimary ? world.colorScheme.primary() : world.colorScheme.secondary()
        colorPrimary = !colorPrimary;
        smallerShapes.push(new GrowingTexturedLineShape(smaller))
    }


    return new UnionShape([new GrowingTexturedLineShape(data), ...smallerShapes])

}

export const genColorSteppedLine = (p5, world, opts) => {
    let {scale} = opts;
    if (scale === 0) {
        throw new Error("scale cannot be 0")
    }
    scale = scale || 1;
    //
    const data = new GrowingTexturedLine();
    data.rotation = getRotationFromFeature(p5, world)
    data.origin = p5.createVector()
    data.origin.x = p5.sb.random() * p5.width * .5;
    data.origin.y = p5.sb.random() * p5.height;

    data.points = [];

    data.width = p5.sb.random(p5.width * .002, p5.width * .023) * scale;
    data.growthFactor = 1 + p5.sb.random(-.02, .015);//* scale;
    data.showIndent = false;//world.features.lineMode(lineModes.inlet)
    const numPoints = 500;
    const periods = p5.sb.random(1, 3);

    const minStep = p5.sb.random(data.width * .5, data.width)
    const maxStep = p5.sb.random(data.width, data.width * 8)

    let px = 0;
    for (let i = 0; i < numPoints; i++) {
        const fi = i / numPoints;
        const len = p5.sb.random(minStep, maxStep)
        px = px + len;
        data.points.push(px, p5.sin(fi * periods * p5.TWO_PI) * data.width);
    }

    data.colorScheme = {
        colorsArray: []
    }
    let colIndex = 0;
    let randBypass = p5.sb.random();
    for (let i = 0; i < numPoints; i++) {
        if (p5.sb.random() < randBypass) {
            colIndex++;
            randBypass = p5.sb.random();
        }
        data.colorScheme.colorsArray.push(world.colorScheme.continuousStepped(colIndex))
    }


    // const smaller = {...data}
    // smaller.width *= p5.sb.random(.1,.8)
    // smaller.colorScheme = {...    smaller.colorScheme}
    // smaller.colorScheme.eye = world.colorScheme.secondary()
    // return new UnionShape([new GrowingTexturedLineShape(data),new GrowingTexturedLineShape(smaller)])

    return new SteppedColorLineShape(data)
}


const getRotationFromFeature = (p5, world) => {
    let rotation;
    if (world.features.angles(angleModes.instectoidAngry)) {
        rotation = p5.sb.random(p5.HALF_PI, p5.PI * 1.5)
    } else if (world.features.angles(angleModes.downwards)) {
        rotation = p5.PI * p5.sb.random(.5, .85)
    } else {
        rotation = p5.PI * p5.sb.random(.95, 1.05)
    }
    return rotation
}

export const genColorSteppedNoiseWalkerLine = (p5, world, opts) => {
    let {scale} = opts;
    if (scale === 0) {
        throw new Error("scale cannot be 0")
    }
    scale = scale || 1;

    const data = new GrowingTexturedLine();
    data.rotation = getRotationFromFeature(p5, world)
    data.origin = p5.createVector()
    data.origin.x = p5.sb.random() * p5.width * .5;
    data.origin.y = p5.sb.random() * p5.height;

    data.points = [];

    if (world.features.largeMode()) {
        data.width = p5.sb.random(p5.width * .04, p5.width * .08) * scale;
    } else {
        data.width = p5.sb.random(p5.width * .01, p5.width * .03) * scale;
    }

    let noiseDet = [];
    const scaleX = data.width * .25; //weight * 0.25; //p5.sb.random(1, 50);
    const scaleY = data.width * .25; //weight * 0.25; //p5.sb.random(1, 50);
    let nx = p5.sb.random(0.1, 5);
    let ny = p5.sb.random(0.1, 5);
    let noiseStep;
    if (world.features.wiggleMode()) {
        noiseDet = [1, 0.01];
        noiseStep = .05;
    } else {
        noiseDet = [p5.sb.random(1, 8), p5.sb.random(.01, .95)];
        noiseStep = .01;
    }


    data.showIndent = false;//world.features.lineMode(lineModes.inlet)

    p5.noiseDetail(noiseDet[0], noiseDet[1]);

    data.growthFactor = 1;//p5.sb.random(1,1.002);
//p5.sb.random(1, 8),p5.sb.random(.01, .95)

    let x = 0
    let y = 0;
    let len = 1000;

    // let numCollisions = 0;
    for (let i = 0; i < len; i++) {
        const x1 = p5.noise(nx) - p5.noise(nx + 1000);
        const y1 = p5.noise(ny) - p5.noise(ny + 1000);
        x += scaleX * .3 + x1 * scaleX * .8;
        y += scaleY * .3 + y1 * scaleY * .8;
        nx += noiseStep;
        ny += noiseStep;
        data.points.push(x, y);
        // insertLinePoint(world, out, i + 1);
    }
    // console.log("collisions", numCollisions);


    data.colorScheme = {
        colorsArray: []
    }
    let colIndex = 0;
    let randBypass = p5.sb.random();
    for (let i = 0; i < len; i++) {
        if (p5.sb.random() < randBypass) {
            colIndex++;
            randBypass = p5.sb.random();
        }
        data.colorScheme.colorsArray.push(world.colorScheme.continuousStepped(colIndex))
    }

    // const smaller = {...data}
    // smaller.width *= p5.sb.random(.1,.8)
    // smaller.colorScheme = {...    smaller.colorScheme}
    // smaller.colorScheme.eye = world.colorScheme.secondary()
    // return new UnionShape([new GrowingTexturedLineShape(data),new GrowingTexturedLineShape(smaller)])

    return new SteppedColorLineShape(data)
}


// this is p5
export function genMouth(world, eyePosition) {
    if (this.sb.random() < .5) {
        return genMouthApproximate(this, world, eyePosition)
    } else {
        return genMouthLines(this, world, eyePosition)
    }
}

const genDust = function (world, opts) {
    const {insideShape, scale} = opts;
    if (insideShape) {
        const shape = insideShape(this, this.width * scale);
    }
}

export const genMouthApproximate = (p5, world, eyePosition) => {
    //
    const data = new MouthApprox();
    data.detail = p5.sb.random(1, 3);
    data.position = p5.createVector(p5.width / 2, eyePosition.y + 200)
    const mouth = mouthPoints(p5, p5.width * .25);
    data.scale = p5.width * .25
    data.pointSize = p5.width * .002
    data.colorScheme = {
        color: world.colorScheme.primary()
    }
    data.points = mouth.getPoints()[0];
    data.svgShape = mouth;


    return new MouthApproxShape(data)
}

export const genLightLanguage = (p5, world) => {
    const scale = p5.sb.random(30, 100);
    const strokeWeight = scale / 15;
    const position = p5.createVector(p5.sb.random(scale, p5.width - scale), p5.sb.random(scale, p5.height - scale))
    const allcharacters = getLightLanguageCharacterIds();
    const characterId = allcharacters[p5.sb.randomInt(0, allcharacters.length)];
    const character = getLightLanguageCharacter(p5, characterId, scale)
    const drawer = new SvgPolygon({
        position: position,
        svgShape: character,
        colorScheme: {
            fill: undefined,
            noStroke: false,
            stroke: world.colorScheme.tertiary(),
            strokeWeight,
            strokeCap: p5.ROUND,
            strokeJoin: p5.ROUND,
        }, points: character.getPoints()
    })
    return drawer
}

export const genHand = (p5, world) => {
    const eyePosition = world.eye.eyeData.position
    const scale = p5.sb.random(200, 400);
    const position = p5.createVector(p5.sb.random(scale, p5.width / 2 - scale), p5.sb.random(eyePosition.y + scale, p5.height - scale))
    const hand = getBodyPart(p5, "hand", scale);
    const drawer = new SvgPolygon({
        position: position,
        svgShape: hand,
        colorScheme: {
            fill: world.colorScheme.tertiary(),
            noStroke: true,
            // stroke: ,
            // strokeWeight:1,
            // strokeCap: p5.ROUND,
            // strokeJoin: p5.ROUND,
        },
        points: hand.getPoints(),
        drawMirror: true,
        rotation: -p5.PI * .9
    })
    return drawer
}

//todo generatoe lines stemming from points in the mouth
export const genMouthLines = (p5, world, eyePosition) => {
    //

    // data.detail = p5.sb.random(1, 3);
    // data.position = p5.createVector(p5.width / 2, eyePosition.y + 200)
    const size = p5.sb.random(.05, .16) * p5.width;
    const mouth = mouthOvalPoints(p5, size);
    const center = mouth.getCenter()
    const position = p5.createVector(p5.width / 2, eyePosition.y + 200)
    const points = mouth.getPoints();
    // data.scale = p5.width * .25
    // data.pointSize = p5.width * .002
    // data.colorScheme = {
    //     color: world.colorScheme.primary()
    // }
    const periods = .0;
    const waveWidth = 10;
    const numMouths = Math.floor(size / 15)

    const lines = [];

    for (let i = 0; i < numMouths; i++) {
        const fi = 1 - i / numMouths;
        const mouthRepeat = mouthOvalPoints(p5, fi * size);
        lines.push(new SvgPolygon({
                position: mouthRepeat.getCenter(),
                colorScheme: {
                    fill: world.colorScheme.continuousStepped(i),
                    noStroke: true
                }, points: mouthRepeat.getPoints(),
                svgShape: mouthRepeat
            })
        )
    }

    for (let point of points[0]) {
        const p = p5.createVector(point.x, point.y)
        ////rotation: 0,
        lines.push(genInlaidLine(p5, world, {
            origin: p,
            width: 5,
            destination: p.copy().mult(3),
            growthFactor: .8,
            periods,
            waveWidth
        }))
    }

    return new UnionShape(lines, position)

}


export class World {
    // shapes; //: ShapeAbs[] = [];

    constructor(features) {
        this.bg = [];
        this.fg = [];
        this.features = features;
        this.eye = undefined;
    }

    render(p5) {
        let i = 0;
        for (let bgElement of this.bg) {
            bgElement.render(p5)
            if (i++ === Math.floor(this.bg.length / 3) || i === Math.floor(2 * this.bg.length / 3)) {
                p5.fill(0, 0, 0, .3)
                p5.rect(0, 0, p5.width, p5.height)
            }
            if (i === Math.floor(this.bg.length * .95)) {
                this.eye.render(p5)
            }
        }
        p5.fill(0, 0, 0, .2)
        p5.rect(0, 0, p5.width, p5.height)
        for (let fgElement of this.fg) {
            fgElement.render(p5)
        }
    }

// quadtree: Quadtree<ShapeItem> = new Quadtree<ShapeItem>({
    //   width: 1,
    //   height: 1,
    // });
    // collisions: P5.Vector[] = [];
    // insertCollision = (x: number, y: number) => {
    //   const c = new P5.Vector();
    //   c.x = x;
    //   c.y = y;
    //
    //   this.collisions.push(c);
    // };
}

