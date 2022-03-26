import {polyPoint} from "./util";

export class Line {
    // points;//: number[];
    // weight;//: number;
    // noiseDetail;//: [number, number];
    // cap;//: p5.MITER | p5.BEVEL | p5.ROUND;

    constructor() {
        this.points = [];
        this.weight = 1;
        this.noiseDetail = [0, 0];
        this.cap = p5.ROUND;
    }
}

export class Circle {
    // points;//: number[];
    // radius;//: number;

    constructor() {
        this.points = [];
        this.radius = 1;
    }
}

export class Blob {
    points;
}

export class EyeData {
    position;
    radius;
    pupilRadius;
    colorScheme;
}


export class ShapeAbs {
    insert;//(t: Quadtree<ShapeItem>);

    render(p5) {
        throw new Error("not implemented")
    };
}

export class ShapeItem {
    height;//: number;
    width;//: number;
    x;//: number;
    y;//: number;
    idx;//: number;
    shape;//: ShapeAbs;
}

export class LineI extends ShapeAbs {
    line;//: Line;

    constructor(line) {
        super();
        this.line = line;
    }

    render(p5) {
        const line = this.line;
        p5.push();

        p5.strokeWeight(2);

        p5.strokeJoin(line.cap);
        p5.beginShape();
        p5.noFill();
        p5.stroke(0);
        for (let i = 0; i < line.points.length; i += 2) {
            p5.vertex(line.points[i], line.points[i + 1]);
        }
        p5.endShape();

        p5.translate(p5.width, 0);
        p5.scale(-1, 1);
        p5.beginShape();
        p5.stroke(0);
        for (let i = 0; i < line.points.length; i += 2) {
            p5.vertex(line.points[i], line.points[i + 1]);
        }
        p5.endShape();

        p5.pop();
    }

    insert(t) {
        for (let i = 0; i < this.line.points.length; i += 2) {
            const item = new ShapeItem();
            item.x = this.line.points[i];
            item.y = this.line.points[i + 1];
            item.width = this.line.weight;
            item.height = this.line.weight;
            item.idx = i;
            item.shape = this;
            t.push(item);
        }
    }
}

export class CircleI extends ShapeAbs {
    circle;//: Circle;

    constructor(circle) {
        super();
        this.circle = circle;
    }

    render(p5) {
        const circle = this.circle;
        p5.push();

        p5.stroke(0);
        p5.circle(circle.points[0], circle.points[1], circle.radius);
        p5.translate(p5.width, 0);
        p5.scale(-1, 1);
        p5.circle(circle.points[0], circle.points[1], circle.radius);

        p5.pop();
    }

    insert(t) {
        //
    }
}

export class BlobI extends ShapeAbs {
    blob;

    constructor(blob) {
        super();
        this.blob = blob;
    }

    render(p5) {
        const blob = this.blob;
        p5.push();

        p5.beginShape();

        p5.stroke(0);
        for (let i = 0; i < blob.points.length; i += 2) {
            p5.vertex(blob.points[i], blob.points[i + 1]);
        }
        p5.endShape(p5.CLOSE);

        p5.translate(p5.width, 0);
        p5.scale(-1, 1);
        for (let i = 0; i < blob.points.length; i += 2) {
            p5.vertex(blob.points[i], blob.points[i + 1]);
        }
        p5.endShape(p5.CLOSE);

        p5.pop();
    }

    insert(t) {
        //
    }
}

export class TwoEye extends ShapeAbs {
    eyeData;

    constructor(eyeData) {
        super();
        this.eyeData = eyeData;
    }

    render(p5) {

        const eyeData = this.eyeData;
        p5.push();

        const eyeShape = () => {
            //
            p5.push()
            p5.translate(eyeData.position.x, eyeData.position.y)
            p5.fill(eyeData.colorScheme.eye)
            p5.noStroke();

            const shift = eyeData.tiltEyeVector
            for (let i = 0; i < eyeData.irisRepeats; i++) {
                const fif = (i / eyeData.irisRepeats);
                p5.push()
                p5.translate(fif * eyeData.radius * shift.x, fif * eyeData.radius * shift.y)
                const fi = 1 - (fif);
                p5.fill(i % 2 === 0 ? eyeData.colorScheme.eye : eyeData.colorScheme.eyeIrus);
                p5.beginShape();

                p5.curveVertex(eyeData.customEyeShape[eyeData.customEyeShape.length - 1].x * fi, eyeData.customEyeShape[eyeData.customEyeShape.length - 1].y * fi)
                for (let customEyeShapeElement of eyeData.customEyeShape) {
                    p5.curveVertex(customEyeShapeElement.x * fi, customEyeShapeElement.y * fi)
                }
                p5.curveVertex(eyeData.customEyeShape[0].x * fi, eyeData.customEyeShape[0].y * fi)
                p5.endShape()
                p5.pop()

            }
            p5.pop()
        }


        const drawEye = () => {
            if (eyeData.customEyeShape) {
                eyeShape();
            } else {
                p5.noStroke();
                p5.fill(eyeData.colorScheme.eye);
                p5.ellipse(eyeData.position.x, eyeData.position.y, eyeData.radius, eyeData.radius);
                const diff = eyeData.radius - eyeData.pupilRadius
                for (let i = 0; i < eyeData.irisRepeats; i++) {
                    const fi = 1 / eyeData.irisRepeats * diff;
                    p5.fill(i % 2 === 0 ? eyeData.colorScheme.eyeIrus : eyeData.colorScheme.eye);
                    p5.ellipse(eyeData.position.x, eyeData.position.y, eyeData.radius - fi * i, eyeData.radius - fi * i);
                }
                p5.fill(eyeData.colorScheme.pupil);
                p5.ellipse(eyeData.position.x, eyeData.position.y, eyeData.pupilRadius, eyeData.pupilRadius);
            }

        }
        drawEye()


        p5.translate(p5.width, 0);
        p5.scale(-1, 1);
        drawEye()

        p5.pop();

        if (eyeData.browShape) {
            eyeData.browShape.render(p5);
        }
    }

    insert(t) {
        //
    }
}


export class GrowingTexturedLine {
    origin;//: pvector;
    points = [];
    width = 2;
    growthFactor = 1.1;
    colorScheme;
    rotation;
    showIndent;
    endCap;
}

export class GrowingTexturedLineShape extends ShapeAbs {
    growingTexturedLine;

    constructor(growingTexturedLine) {
        super();
        this.growingTexturedLine = growingTexturedLine;
    }

    render(p5) {
        const {
            origin,
            points,
            width,
            growthFactor,
            rotation,
            colorScheme,
            doNotDuplicate,
            endCap,
        } = this.growingTexturedLine;

        const ren = (second) => {
            p5.push();
            if (second) {
                p5.translate(p5.width, 0);
                p5.scale(-1, 1);
            }
            p5.translate(origin.x, origin.y)

            //debug
            // p5.fill('red');
            // p5.ellipse(0, 0, 5, 5)
            p5.rotate(rotation)
            p5.strokeWeight(1);
            p5.stroke(colorScheme.eye);
            p5.fill(colorScheme.eye)

            if (endCap) {
                p5.ellipse(0, 0, width * 2, width * 2)
            }

            p5.beginShape(p5.QUAD_STRIP);
            const pts = points;
            let w = width;

            for (let i = 2; i < pts.length; i += 2) {
                const px = pts[i - 2]
                const py = pts[i - 1]
                const x = pts[i]
                const y = pts[i + 1]
                const vx = x - px;
                const vy = y - py;
                const perpLeft = p5.createVector(-vy, vx)
                perpLeft.normalize()
                const perpRight = perpLeft.copy()
                perpRight.mult(-1)
                perpLeft.mult(w)
                perpRight.mult(w)


                if (i === 2) {
                    p5.vertex(px + perpLeft.x, py + perpLeft.y)
                    p5.vertex(px + perpRight.x, py + perpRight.y)
                }

                p5.vertex(x + perpLeft.x, y + perpLeft.y)
                p5.vertex(x + perpRight.x, y + perpRight.y)

                w *= growthFactor
                // if (w * 2 < 1) {
                //     break;
                // }
            }
            p5.endShape();
            if (endCap) {
                p5.ellipse(pts[pts.length - 2], pts[pts.length - 1], w * 2, w * 2)
            }
            p5.pop();
        }
        ren()
        if (!doNotDuplicate) {
            ren(true)
        }


    }

    insert(t) {
        //
    }
}

export class SteppedColorLineShape extends ShapeAbs {
    growingTexturedLine;

    constructor(growingTexturedLine) {
        super();
        this.growingTexturedLine = growingTexturedLine;
    }

    render(p5) {
        const {
            origin,
            points,
            width,
            growthFactor,
            rotation,
            colorScheme,
            showIndent
        } = this.growingTexturedLine;

        const ren = (second) => {
            p5.push();
            if (second) {
                p5.translate(p5.width, 0);
                p5.scale(-1, 1);
            }
            p5.translate(origin.x, origin.y)
            p5.rotate(rotation)

            const pts = points;
            let w = width;
            const colors = colorScheme.colorsArray;
            let ppx1 = 0;
            let ppy1 = 0;
            let ppx2 = 0;
            let ppy2 = 0;
            for (let i = 2; i < pts.length; i += 2) {
                p5.strokeWeight(2);
                p5.noStroke();
                p5.strokeJoin(p5.ROUND)
                p5.strokeCap(p5.SQUARE)
                p5.stroke(colors[i / 2 % colors.length]);
                p5.fill(colors[i / 2 % colors.length])
                p5.beginShape();

                const px = pts[i - 2]
                const py = pts[i - 1]
                const x = pts[i]
                const y = pts[i + 1]
                const vx = x - px;
                const vy = y - py;
                const perpLeft = p5.createVector(-vy, vx)
                perpLeft.normalize()
                const perpRight = perpLeft.copy()
                perpRight.mult(-1)
                perpLeft.mult(w)
                perpRight.mult(w)
                w *= growthFactor
                if (i === 2) {
                    p5.vertex(px + perpLeft.x, py + perpLeft.y)
                    p5.vertex(px + perpRight.x, py + perpRight.y)
                } else {
                    p5.vertex(ppx2, ppy2)
                    p5.vertex(ppx1, ppy1)
                }
                ppx1 = x + perpRight.x
                ppy1 = y + perpRight.y
                ppx2 = x + perpLeft.x
                ppy2 = y + perpLeft.y
                p5.vertex(ppx1, ppy1)
                p5.vertex(ppx2, ppy2)

                p5.endShape();

                if (showIndent) {
                    // p5.fill('red')
                    p5.ellipse(px, py, w, w,)
                }
            }
            p5.pop();


        }
        ren()
        ren(true)

    }

    insert(t) {
        //
    }
}


export class UnionShape extends ShapeAbs {
    shapes = [];

    constructor(shapes, position) {
        super()
        this.shapes = shapes || [];
        this.position = position || {
            x: 0,
            y: 0
        }
    }

    render(p5) {
        p5.push()
        p5.translate(this.position.x, this.position.y)
        this.shapes.forEach(shape => {
            shape.render(p5)
        })
        p5.pop()
    }
}

export class LineGridTexture extends ShapeAbs {

}

export class MouthApprox {
    detail = 0;
    sizeRange = [1, 10]
    points = []
}

export class MouthApproxShape extends ShapeAbs {
    mouthApprox = {};

    constructor(mouthApprox) {
        super()
        this.mouthApprox = mouthApprox || {};
    }

    debugDisplayMouth() {
        p5.push()
        p5.translate(this.mouthApprox.position.x, this.mouthApprox.position.y)
        p5.fill(240, 100, 100)
        p5.stroke(0, 100, 100)
        p5.beginShape();
        for (let point of this.mouthApprox.points) {
            p5.vertex(point.x, point.y)
        }
        p5.endShape();
        p5.pop()
    }

    render(p5) {

        p5.push()
        p5.translate(this.mouthApprox.position.x, this.mouthApprox.position.y)
        const d = this.mouthApprox
        p5.fill(240, 100, 100)
        // p5.stroke(255, 100, 100)
        p5.noStroke()
        p5.fill(d.colorScheme.color)
        const randTriangle = () => {
            const a1 = p5.sb.random(0, p5.TWO_PI)
            const a2 = p5.sb.random(0, p5.TWO_PI)
            const a3 = p5.sb.random(0, p5.TWO_PI)
            return [p5.cos(a1), p5.sin(a1), p5.cos(a2), p5.sin(a2), p5.cos(a3), p5.sin(a3)].map(p => p * d.pointSize)
        }
        for (let i = 0; i < 5000; i++) {
            const p = {
                x: p5.sb.random(d.svgShape.boundingBox.l, d.svgShape.boundingBox.r),
                y: p5.sb.random(d.svgShape.boundingBox.t, d.svgShape.boundingBox.b)
            }
            const coll = polyPoint(this.mouthApprox.points,
                p.x, p.y)
            if (coll) {
                // p5.ellipse(p.x, p.y, 3);
                p5.push()
                p5.translate(p.x, p.y)
                p5.triangle(...randTriangle())
                p5.pop()
            }
        }

        p5.pop()
    }
}

export class SvgPolygon extends ShapeAbs {
    constructor(data) {
        super()
        this.data = data;
    }

    render(p5) {
        const rend = (second) => {


            p5.push()
            if (second) {
                p5.translate(p5.width, 0);
                p5.scale(-1, 1);
            }
            p5.translate(this.data.position.x, this.data.position.y)

            if (this.data.rotation) {
                p5.rotate(this.data.rotation)
            }

            // p5.fill('red')
            // p5.ellipse(0, 0, 10)


            if (this.data.colorScheme.fill) {
                p5.fill(this.data.colorScheme.fill)
            } else {
                p5.noFill()
            }
            if (this.data.colorScheme.noStroke)
                p5.noStroke()
            if (this.data.colorScheme.stroke) {
                p5.stroke(this.data.colorScheme.stroke)
            }
            if (this.data.colorScheme.strokeWeight) {
                p5.strokeWeight(this.data.colorScheme.strokeWeight)
            }
            if (this.data.colorScheme.strokeCap) {
                p5.strokeCap(this.data.colorScheme.strokeCap)
            }
            if (this.data.colorScheme.strokeJoin) {
                p5.strokeJoin(this.data.colorScheme.strokeJoin)
            }
            p5.beginShape()
            if (this.data.svgShape.isMultiPart()) {

                for (let pointArray of this.data.points) {
                    p5.beginShape()
                    for (let point of pointArray) {
                        p5.vertex(point.x, point.y)
                    }
                    p5.endShape();
                }

            } else {
                p5.beginShape()
                for (let point of this.data.points) {
                    p5.vertex(point.x, point.y)
                }
                p5.endShape();

            }
            p5.pop()
        }
        rend(false)
        if (this.data.drawMirror) {
            rend(true)
        }

    }
}

export class HeadData {
    position;
    colorScheme;
}

export class MaskShape extends ShapeAbs {
    constructor(eyeData) {
        super()
        this.eyeData = eyeData;
    }

    render(p5) {
        let d = this.eyeData;
        p5.push()
        p5.translate(d.position.x, d.position.y)
        p5.noStroke()
        p5.fill(d.colorScheme.fill)

        // p5.ellipse(0, 0, d.width, d.height)


        p5.ellipse(-d.radius, 0, d.pupilRadius, d.pupilRadius)
        // p5.fill('red')
        p5.ellipse(d.radius, 0, d.pupilRadius, d.pupilRadius)
        p5.pop()
        for (let growingTexturedLine of d.growingTexturedLines) {
            growingTexturedLine.render(p5)
        }
    }
}
