// import P5 from "p5";
import p5 from "p5";
import {World} from "./gen-faces.js"
import {PRNGRand} from "./random";
import polygonClipping from "polygon-clipping";
import {randomPolygon} from "./polygon/random-polygon";
import {positionToBounds} from "./polygon/boundingbox";
import {nestedToObject, objectToNested} from "./polygon/util";
import {mapRange} from "./util";
import {
    identityMatrix, multiply,
    multiplyMatrices,
    multiplyMatrixAndPoint,
    rotateAroundXAxis,
    rotateAroundZAxis,
    translationMatrix
} from "./matrix/matrix";
import {mapColor, clamp} from "./gen";
// import "p5/lib/addons/p5.dom";
// // import "p5/lib/addons/p5.sound";	// Include if needed
// import "./styles.scss";
// import Quadtree from "quadtree-lib";
// Creating the sketch itself
var Offset = require('polygon-offset');

const canvasBorder = 1.0;//0..1
const isProd = true;
window.previewReady=false;
let traits = {};
// window.getTraits = function(){
//     return traits;
// }

const sketch = (p5) => {
        let millis = 0;
        let world = new World();
        let needsRender = true;
        let seed = 0;
        let llcharactersXML;
        let bodyPartsXML;

        let polys = {};
        const resetPolys = () => {
            polys = {outline: [], fill: [], drawable: []}
        };
        const gen = (newSeed) => {
            needsRender = true;
            if (newSeed) {
                let alphabet = "123456789ABCDE"
                seed= Array(64).fill(0).map(_=>alphabet[(Math.random()*alphabet.length)|0]).join('')
            }
            console.log({seed})
            // seed=1648427511445;
            p5.sb = new PRNGRand(seed)
            console.log({seed})
            // let settings = getFeatures(p5.sb);

            // console.log("seed", seed)
            p5.randomSeed(seed);
            p5.noiseSeed(seed);

            resetPolys()
            // const poly1 = [[[0, 0], [2, 0], [0, 2], [0, 0]].map(p => [p[0] * 100 + p5.mouseX, p[1] * 100 + p5.mouseY])]
            // const poly2 = [[[-1, 0], [1, 0], [0, 1], [-1, 0]].map(p => [p[0] * 200 + 200, p[1] * 200 + 200])]
            // let offset = new Offset();
            // let padding = offset.data((poly2)).offset(-40);
            // const clipped = polygonClipping.xor(poly1, poly2)
            // polys.fill.push(clipped)
            // polys.outline.push(poly2,padding)


            const isMultiPolygon = (pg) => !Number.isFinite(pg[0]?.[0])
            const generateShape = ({parent, x, y, black, w, resolution}) => {
                // console.log({w})
                //takes flat array of object {x,y} points and returns a polygon
                const rngbb = positionToBounds({
                    x: x || p5.sb.random(p5.width * .25, p5.width * .75),
                    y: y || p5.sb.random(p5.height * .25, p5.height * .75),
                    w: p5.sb.random(p5.width * .25, w || p5.width * .5),
                    h: p5.sb.random(p5.height * .25, p5.height * .3),
                })
                const bb = parent?.getBoundingBox() || rngbb
                // console.log('bb', bb)
                let containIn = parent?.points;
                // if (containIn) {
                //     const shrinkBy = p5.sb.random(.8, 1)
                //     // console.log('objectToNested', objectToNested(containIn))
                //     const padIn = objectToNested(containIn)
                //     // padIn.push(padIn[0])
                //     let offset = [objectToNested(containIn)];//new Offset().data([objectToNested(containIn)]).offset(-p5.width/90);
                //     //now clip it by the parent poly.
                //     let resolvedOffset = polygonClipping.intersection(offset, [padIn])
                //     if (isMultiPolygon(resolvedOffset) && resolvedOffset.length > 1) {
                //         // polys.outline.push(containIn)
                //         polys.outline.push(resolvedOffset[0])
                //     }
                //     // console.log("offset", resolvedOffset)
                //     containIn = nestedToObject(isMultiPolygon(resolvedOffset) ? resolvedOffset[0] : resolvedOffset);
                //     containIn = parent.points
                // }

                const res =p5.sb.randomInt(20,300) 
                 resolution = resolution || res;

                const insidePoints = containIn;
                // const insidePoints = undefined;
                return randomPolygon(p5.sb, bb, {resolution, insidePoints, black})
            }

            const genShape = (x, y, w, n, resolution) => {
                let prev;
                let i = n;//
                let black = true;
                do {
                    prev = generateShape({parent: prev, x, y, black, w, resolution})
                    //prev.points.forEach((p)=>console.log(p))
                    black = !black;
                    // console.log('new shape',prev)
                    polys.drawable.push(prev)
                } while (--i)
                
                return {prev, black};
            }

            const genEye = (x, y, n) => {

                let {prev, black} = genShape(x, y, undefined, n);
                const bb = prev.getBoundingBox().scale(0.15);
                //res better with 10
                // polys.drawable.push(randomPolygon(p5.sb, bb, {resolution: 10, insidePoints: prev.points, black}))
                return prev;
            }
            const genEyes = (x, y) => {
                
                const ln = p5.sb.randomInt(1, 10);
                const rn = p5.sb.randomInt(1, 10);
                const eye1 = genEye(x, y, ln)
                // console.log('left eye')
                const eye2 = genEye(p5.width - x, y, rn)
                // console.log('right eye')
            }
            const genMouth = (x, y, w) => {
                console.log('mouth gen')
                let n = p5.sb.randomInt(0, 4)*2+1;
                //all crooked, all random, or all high resolution
                const teeth = p5.sb.randomList(['thick','crooked','rand'])
                let resolution=1;
                switch (teeth) {
                    case 'thick':
                        resolution = p5.sb.randomInt(250,300);break;
                    case 'crooked':
                        resolution = p5.sb.randomInt(30,100);break;
                    case 'rand':
                        resolution = p5.sb.randomInt(50,300);break;
                    default: throw new Error('missing teeth');
                }
                let {prev, black} = genShape(x, y, w,n, resolution)
                const opts = ['both', 'top', 'bottom', 'none'];
                const teethOption = opts[Math.floor(mapRange(Math.pow(p5.sb.random(), 1.8), 0, 1, 0, opts.length))];
                let tTop, tBottom;
                if (teethOption === 'both' || teethOption === 'top') {
                    tTop = true;
                }
                if (teethOption === 'both' || teethOption === 'bottom') {
                    tBottom = true;
                }
                console.log({teethOption})
                const makeTeethRow = (numTeeth, isTop) => {
                    for (let j = 0; j < numTeeth; j++) {
                        const bb = prev.getBoundingBox();
                        if (isTop) {//move the bottom up
                            bb.b = bb.t + (bb.b - bb.t) / 2;
                        } else {
                            bb.t = bb.t + (bb.b - bb.t) / 2;
                        }

                        bb.l = bb.l + (bb.r - bb.l) / numTeeth * j;
                        bb.r = bb.l + (bb.r - bb.l) / numTeeth * (j + 1);

                        
                        const teethResolution = Math.floor(Math.pow(p5.sb.random(), 7)*40+10)
                        polys.drawable.push(randomPolygon(p5.sb, bb, {resolution: teethResolution, insidePoints: prev.points, black}))
                    }
                }

                const teethTop  = p5.sb.randomInt(2, 8)
                const teethBottom  = p5.sb.randomInt(3, 8)
                if (tTop) {
                    makeTeethRow(teethTop, true)
                }
                if (tBottom) {
                    makeTeethRow(teethBottom, false)
                }


                return prev;
            }
            traits.background = p5.sb.randomRgb();
            let x = p5.width * .25;//p5.sb.randomInt(p5.width * .25, p5.width * .5);
            let y = p5.height * .3;
            genEyes(x, y)
            console.log('gen mouth!')
            genMouth(p5.width * .5, p5.height - y, p5.width * .75)

            // console.log("DEBUG COUNTER", p5.sb.debugCounter)

            // console.log("finished shapes")

            // const parent = new PolygonXY(sampleparent);
            // polys.drawable.push(parent)
            // polys.drawable.push(generateShape(parent))


        };

        let canvas; //p5 canvas
        p5.setup = () => {
            // Creating and positioning the canvas
            const s = Math.min(p5.windowHeight, p5.windowWidth) * canvasBorder
            canvas = p5.createCanvas(s, s); // p5.windowWidth, p5.windowHeight);

            p5.pixelDensity(1)
            // p5.colorMode(p5.HSB)
            canvas.parent("sketch");

            const seedQp = new URL(window.location.href).searchParams.get("hash")

            if (seedQp) {
                seed = seedQp;
            }
            gen(!seedQp);
            if (isProd && document.getElementById('fps')) {
                document.getElementById('fps').style.display = 'none';
            }
        };

        p5.keyReleased = () => {
            if (p5.key === ' ') {
                gen(true)
                p5.loop()
            }
            if (p5.key === 's') {
                p5.saveCanvas(canvas, "weave-" + seed, "png");
            }
            if (p5.key === 'd') {
                p5.debugDraw = !p5.debugDraw
                p5.loop()
            }
            // return false;
        };
        const setdebugArea = (text) => {
            document.getElementById('debugArea').innerHTML = text;
        }

// The sketch draw method
        p5.windowResized = () => {
            const s = Math.min(p5.windowHeight, p5.windowWidth) * canvasBorder
            p5.resizeCanvas(s, s);
            needsRender = true
            gen(false)
        };
        p5.draw = () => {
            p5.background(traits.background);
            millis = millis + 1 / p5.frameRate();
            // console.log(p5.frameRate());

            document.getElementById("fps").innerText = p5.frameRate().toFixed(0);

            // gen(false)


            // const drawPoly = (pg, outlineOnly) => {
            //     if (pg[0]?.[0] && !Number.isFinite(pg[0]?.[0])) {
            //         if (!pg.forEach) {
            //             throw new Error("not a polygon")
            //         }
            //         pg.forEach(drawPoly)
            //     }
            //     p5.beginShape()
            //     for (let p of pg) {
            //         p5.vertex(p[0], p[1])
            //     }
            //     p5.endShape(p5.CLOSE)
            // }
            // p5.stroke(0, 0, 255)
            // p5.push()
            // p5.noFill()
            //
            // polys.drawable.forEach(p => p.draw(p5))
            //
            // if (p5.debugDraw) {
            //
            //     // p5.stroke(255, 255, 0)
            //     polys.outline.forEach(drawPoly)
            //     // poly2.forEach(drawPoly)
            //     p5.fill(255)
            //     polys.fill.forEach(drawPoly)
            //     p5.pop()
            //
            //
            //     if (polys.fill.length) {
            //         setdebugArea(polys.fill[0].length)
            //         if (polys.fill[0].length === 1)
            //             console.log("clipped", polys.fill[0])
            //     }
            // }
            
            p5.loadPixels()
            // const pixels = p5.pixels
            const w2 = p5.width/2;
            const h2 = p5.height/2;
            p5.noStroke();
            const mouse=[p5.mouseX/p5.width ,p5.mouseY/p5.height];
            const colors = [
                p5.color(200,200,240),
                p5.color(255),
                p5.color(255,0,0),
                p5.color(255,255,0),
            ]
            for (let y = 0; y < p5.height; y++) {
            for (let x = 0; x < p5.width; x++) {
                let xi = (x/p5.width-0.5)*2.0
                let yi = (y/p5.height-0.5)*2.0
                const dist = p5.dist(xi,yi,0,0);
                
                
                const scalar = (0.5-dist)*200.0;
                const p = multiply( [
                    rotateAroundZAxis(dist*(mouse[0]*scalar)*1.1),
                ],[xi,yi]);
                let color;
               
                color = mapColor(p5, clamp((p[1]+1)/2 ), colors)

                p5.set(x,y,color)
                }
            }
            p5.updatePixels()
            
            // p5.noLoop()
            // console.log("finished draw")
            window.attributes = ({'hello':'stew'});
            window.previewReady=1;
            // console.log({previewReady})
            
        };
    }
;

document.addEventListener('previewReady',()=>{
    console.log("PREVIEW READY")
})
new p5(sketch);
