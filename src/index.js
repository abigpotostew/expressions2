// import P5 from "p5";
import p5 from "p5";
import {World} from "./gen-faces.js"
import {PRNGRand} from "./random";
import {randomPolygon} from "./polygon/random-polygon";
import {positionToBounds} from "./polygon/boundingbox";
import {mapRange} from "./util";
import {colorFunctions, filterFunctions, mappingFunctions} from "./gen";
import {rotateAroundZAxis, scaleMatrix, translationMatrix} from "./matrix/matrix";
// import "p5/lib/addons/p5.dom";
// // import "p5/lib/addons/p5.sound";	// Include if needed
// import "./styles.scss";
// import Quadtree from "quadtree-lib";
// Creating the sketch itself
var Offset = require('polygon-offset');

const canvasBorder = 1.0;//0..1
const isProd = true;
window.previewReady = false;
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
        let pixelsToDrawn;
        let randerRand;
let genTime;
        let polys = {};
        const resetPolys = () => {
            polys = {outline: [], fill: [], drawable: []}
        };
        const gen = (newSeed) => {
            
            needsRender = true;
            if (newSeed) {

                randerRand = new PRNGRand(seed)
                pixelsToDrawn = [...Array(p5.width*p5.height).keys()];
                // pixelsToDrawn.forEach((v,i,l)=>l[i]=i);
                genTime = p5.millis()/1000
                p5.background(200);
                let alphabet = "123456789ABCDE"
                seed = Array(64).fill(0).map(_ => alphabet[(Math.random() * alphabet.length) | 0]).join('')
                console.log({seed})
            }
            // seed=1648427511445;
            p5.sb = new PRNGRand(seed)
            
            return;
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

                const res = p5.sb.randomInt(20, 300)
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
                let n = p5.sb.randomInt(0, 4) * 2 + 1;
                //all crooked, all random, or all high resolution
                const teeth = p5.sb.randomList(['thick', 'crooked', 'rand'])
                let resolution = 1; 
                switch (teeth) {
                    case 'thick':
                        resolution = p5.sb.randomInt(250, 300);
                        break;
                    case 'crooked':
                        resolution = p5.sb.randomInt(30, 100);
                        break;
                    case 'rand':
                        resolution = p5.sb.randomInt(50, 300);
                        break;
                    default:
                        throw new Error('missing teeth');
                }
                let {prev, black} = genShape(x, y, w, n, resolution)
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


                        const teethResolution = Math.floor(Math.pow(p5.sb.random(), 7) * 40 + 10)
                        polys.drawable.push(randomPolygon(p5.sb, bb, {
                            resolution: teethResolution,
                            insidePoints: prev.points,
                            black
                        }))
                    }
                }

                const teethTop = p5.sb.randomInt(2, 8)
                const teethBottom = p5.sb.randomInt(3, 8)
                if (tTop) {
                    makeTeethRow(teethTop, true)
                }
                if (tBottom) {
                    makeTeethRow(teethBottom, false)
                }


                return prev;
            }
            // traits.background = p5.sb.randomRgb();
            // let x = p5.width * .25;//p5.sb.randomInt(p5.width * .25, p5.width * .5);
            // let y = p5.height * .3;
            // genEyes(x, y)
            // console.log('gen mouth!')
            // genMouth(p5.width * .5, p5.height - y, p5.width * .75)

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
            // p5.smooth(8);
            //
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

            gen(false)
            // p5.background(traits.background);
            // p5.background(0);
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
            const w2 = p5.width / 2;
            const h2 = p5.height / 2;
            p5.noStroke();
            const mouse = [p5.mouseX / p5.width, p5.mouseY / p5.height];
            p5.normalizedMouse = mouse;
            const colors = [
                p5.color('#F94B42'),
                p5.color('#ff5c39'),
                // p5.color('#337a6e'),
                // p5.color('#ff5c39'),
                // p5.color(255, 0, 0),
                // p5.color(255, 255, 0),
                // p5.color('#3f27bb'),
                // p5.color('#5842C8'),
                p5.color('#f3c0ae'),
                p5.color('#f3dddd'),

                p5.color('#e3f1b2'),
                p5.color('#f3f8e2'),
                
                p5.color('#c1e8f1'),
                p5.color('#d6e6ea'),
                // p5.color(255, 0, 0),
                // p5.color(255, 255, 0),

                // p5.color(255, 0, 255),
                // p5.color(0, 0, 255),
            ]

            const soft_hill_gen = (offset = 1) => {
                const sy = p5.sb.random()
                return (x, y) => {
                    return [
                        rotateAroundZAxis(0.1 + p5.sin(x * 3.28 + mouse[0] * 100))
                        , translationMatrix(0, -1.955 + 0.5 * offset, 0)
                        , scaleMatrix(1, 9.125)
                    ]
                }
            }

            const steep_landscape = (offset = 1) => {
                const sy = p5.sb.random()*0.1
                return (x, y) => {
                    let ss = p5.sin(x * 10.28 )* 0.2
                    ss += p5.sin(x * 20.28 ) * 0.07
                    ss += p5.sin(x * 40.28 ) * 0.04
                    ss += sy;
                    ss *= 0.25
                    return [
                        // rotateAroundZAxis(0.1 + p5.sin(x * 3.28 + mouse[0] * 100))
                        //+ p5.sin(ss)*0.9+1.0 -1.5
                         translationMatrix(0, Math.pow(x-0.5,2) , 0)
                        // , scaleMatrix(1, 1.125)
                    ]
                }
            }
            
            let timeDraw = genTime;

            let hill_offset = p5.sb.random(4.4, 6.4);

            const soft_hill_gen2 = (offset) => {
                const sy = hill_offset * p5.sb.random() * 0.2

                
                return (x, y) => {
                    let ss = p5.sin(x * 10.28 + timeDraw) * 0.3
                    ss += p5.sin(x * 20.28 + timeDraw) * 0.15
                    ss += p5.sin(x * 40.28 + timeDraw) * 0.07
                    ss *= 0.25
                    ss += sy;
                    return [
                        translationMatrix(.5, .5, 0),
                        rotateAroundZAxis(ss),

                        translationMatrix(-0.5, -0.5)
                        // , translationMatrix(0, -1.955+0.5*offset, 0)
                        , translationMatrix(0, .1 * offset + -0.75, 0)
                        , scaleMatrix(1, 3.125)
                    ]
                }
            }

            const layer = (matrix_fn, filter_fn, color_fn, colors) => {
                return {
                    matrix: matrix_fn,
                    filter: filter_fn,
                    color: color_fn,
                    colors: colors
                }
            }

            const colorsBg = [colors[0], colors[1]]
            const colorsFg = [colors[2], colors[3], colors[3],colors[3]]
            const colorsFg2 = [colors[4], colors[5], colors[5], colors[5]]
            const colorsFg3 = [colors[6], colors[7], colors[7],colors[7]]
            
            const allColors = [
                [colors[0], colors[1]],
                [colors[2], colors[3], [], []],
                    [colors[4], colors[5], [], []],
                [colors[6], colors[7], [], []],
                ];
            let bgLayers = [
                layer(soft_hill_gen2, null, colorFunctions.twoGradientY, colorsBg),
                layer(steep_landscape, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors)),
            ].map((l, i, m) => {l.matrix = l.matrix(i, i / m.length); return l;})
            let layers = [];
            let n = 10;
            for (let i = 0; i < n; i++) {
                let l = layer(soft_hill_gen2, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors));
                l.matrix = l.matrix(i, i / n);
                layers.push(l)
            }
            // let layers = [
            //     layer(soft_hill_gen2, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors)),
            //     layer(soft_hill_gen2, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors)),
            //     layer(soft_hill_gen2, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors)),
            //     layer(soft_hill_gen2, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors)),
            //    
            // ].map((l, i, m) => {l.matrix = l.matrix(i, i / m.length); return l;})

            // let soft_hills = soft_hill_gen2(1,num_layers)
            // let soft_hills2 =soft_hill_gen2(2,num_layers)
            //     (x,y)=>{
            //     return [rotateAroundZAxis(0.1 +
            //         ((p5.sin(2*x * 3.28)+p5.sin(1.356*x * 3.28))*0.5)+0.5
            //     )
            //         , translationMatrix(0, -.0955, 0)
            //         , scaleMatrix(1, 19.125)
            //     ]
            // }

            layers.reverse()
            //todo draw it over time using random point x, y


            let numRender = Math.min(pixelsToDrawn.length, 10000)
            // let rendered=[];
            for (let i = 0; i < numRender; i++) {
                let index = randerRand.random(0,pixelsToDrawn.length-1)
                let drawi = pixelsToDrawn[index]
                pixelsToDrawn[index] = null
                // let j = sb.randomInt(0,numRender)
                let x = drawi%p5.width;
                let y = (drawi-x)/p5.width;
                    // let y = (drawi-p5.width)/p5.width;
                // let x = Math.floor(Math.random() * p5.width);
                // let y = Math.floor(Math.random() * p5.height);
                
                // for (let y = 0; y < p5.height; y++) {
                //     for (let x = 0; x < p5.width; x++) {
                // let xi = (x / p5.width - 0.5) * 2.0
                // let yi = (y / p5.height - 0.5) * 2.0
                let p, color;


                p=null;color=null
                for (let layer of bgLayers) {
                    p = mappingFunctions.matrix_apply(p5, x, y, layer.matrix)
                    if (layer.filter && !!p) p = filterFunctions.filter_apply(p5, p, layer.filter)
                    if (p) color = layer.color(p5, p, layer.colors)
                    if (color) {
                        p5.set(x, y, color)
                        // break;
                    }
                }
                p=null;color=null
                for (let layer of layers) {
                    p = mappingFunctions.matrix_apply(p5, x, y, layer.matrix)
                    if (layer.filter && !!p) p = filterFunctions.filter_apply(p5, p, layer.filter)
                    if (p) color = layer.color(p5, p, layer.colors)
                    if (color) {
                        p5.set(x, y, color)
                        break;
                    }
                }
                //  p = mappingFunctions.matrix_apply(p5, x, y, layers[0])
                //  // p = filterFunctions.filter_apply(p5, p, filterFunctions.isY_gt(0.5))
                // if(p) color = colorFunctions.twoGradientY(p5, p, colorsBg)
                // if(color) {
                //     p5.set(x, y, color)
                // }
                //
                // p = mappingFunctions.matrix_apply(p5, x, y, layers[1])
                // p = filterFunctions.filter_apply(p5, p, filterFunctions.isY_lt(0.5))
                // if(p) color = colorFunctions.twoGradientY(p5, p, colorsFg)
                // if(color) {
                //     p5.set(x, y, color)
                // }
                //
                // p = mappingFunctions.matrix_apply(p5, x, y, layers[2])
                // p = filterFunctions.filter_apply(p5, p, filterFunctions.isY_lt(0.5))
                // if(p) color = colorFunctions.twoGradientY(p5, p, colorsFg2)
                // if(color) {
                //     p5.set(x, y, color)
                // }


                // }
                // }
            }
            var i = pixelsToDrawn.length
            while (i--) {
            
                if (pixelsToDrawn[i]===null) {
                    pixelsToDrawn.splice(i, 1);
                }
            }
            // pixelsToDrawn= pixelsToDrawn.filter(i=>i!==null)
            console.log(pixelsToDrawn.length)
            
            // console.log({maxSs})
            p5.updatePixels()

            // p5.noLoop()
            // console.log("finished draw")
            window.attributes = ({'hello': 'stew'});
            window.previewReady = 1;
            // console.log({previewReady})

        };
    }
;

document.addEventListener('previewReady', () => {
    console.log("PREVIEW READY")
})
new p5(sketch);
