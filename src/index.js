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
        let renderStyle = 0;
        let genTime;
        let renderCount = 0;
        let polys = {};
        const resetPolys = () => {
            polys = {outline: [], fill: [], drawable: []}
        };
        const gen = (newSeed, reset) => {

            needsRender = true;
            
            if (newSeed) {
                // pixelsToDrawn.forEach((v,i,l)=>l[i]=i);
                
                let alphabet = "123456789ABCDE"
                seed = Array(64).fill(0).map(_ => alphabet[(Math.random() * alphabet.length) | 0]).join('')
                console.log({seed})
            }


            //todo the image doesn't complete on smaller screens in 150 loops
            if(newSeed||reset){
                renderCount=0;
                randerRand = new PRNGRand(seed)
                randerRand.random();
                randerRand.random();
                if (renderStyle === 1) {
                    pixelsToDrawn = [...Array(p5.width * p5.height).keys()];
                }
                genTime = randerRand.random(0,12334)

                p5.background(0);
            }
            
            // seed=1648427511445;
            p5.sb = new PRNGRand(seed)

            return;

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
            p5.noSmooth()
            //
            const seedQp = new URL(window.location.href).searchParams.get("hash")

            if (seedQp) {
                seed = seedQp;
            }
            gen(!seedQp, true);
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
            gen(false, true)
        };
        p5.draw = () => {

            gen(false)
            // p5.background(traits.background);
            // p5.background(0);
            millis = millis + 1 / p5.frameRate();
            // console.log(p5.frameRate());


            document.getElementById("fps").innerText = p5.frameRate().toFixed(0);

            // const pixels = p5.pixels
            const w2 = p5.width / 2;
            const h2 = p5.height / 2;
            p5.noStroke();
            const mouse = [p5.mouseX / p5.width, p5.mouseY / p5.height];
            p5.normalizedMouse = mouse;
            
            const palettes = [[
                p5.color('#F94B42'),
                p5.color('#ff5c39'),

                p5.color('#faa78a'),
                p5.color('#fdf8f8'),
                p5.color('#fdd05a'),
                p5.color('#624086'),
                p5.color('#c1e8f1'),
                p5.color('#d6e6ea'),
                ],
                [
                    p5.color('#dc2918'),
                    p5.color('#600f0f'),
                    
                    p5.color('#ee3f02'),
                    p5.color('#fa7f55'),
                    
                    p5.color('#98624f'),
                    p5.color('#b7a9a3'),

                    p5.color('#624086'),
                    p5.color('#f5b81d'),
                    
                    p5.color('#c6dce1'),
                    p5.color('#4d8d9d'),
                ],
                [

                    p5.color('#e3f1b2'),
                    p5.color('#f3f8e2'),
                    
                    p5.color('#f3c0ae'),
                    p5.color('#f3dddd'),

                    p5.color('#624086'),
                    p5.color('#fdd05a'),


                    p5.color('#e3f1b2'),
                    p5.color('#f3f8e2'),
                ],
                [

                    p5.color('#484646'),
                    p5.color('#232222'),
                    
                    p5.color('#d4f5d0'),
                    p5.color('#ddf3f1'),

                    p5.color('#6b1bc0'),
                    p5.color('#9c50ec'),

                    p5.color('#ffffff'),
                    p5.color('#e1dcc7'),
                ],
                [

                    p5.color('#4b9603'),
                    p5.color('#03965e'),
                    
                    p5.color('#d4f5d0'),
                    p5.color('#ddf3f1'),

                    p5.color('#956cc0'),
                    p5.color('#c19de7'),

                    p5.color('#ffffff'),
                    p5.color('#e1dcc7'),
                ]
                
            ]
            const palette = p5.sb.randomList(palettes) 
            const colors =palette;
                [
                p5.color('#F94B42'),
                p5.color('#ff5c39'),
                // p5.color('#337a6e'),
                // p5.color('#ff5c39'),
                // p5.color(255, 0, 0),
                // p5.color(255, 255, 0),
                // p5.color('#3f27bb'),
                // p5.color('#5842C8'),

                // light reds tans
                p5.color('#f3c0ae'),
                p5.color('#f3dddd'),

                p5.color('#faa78a'),
                p5.color('#fdf8f8'),

                p5.color('#fdd05a'),
                p5.color('#624086'),

                // greens
                // p5.color('#e3f1b2'),
                // p5.color('#f3f8e2'),

                p5.color('#c1e8f1'),
                p5.color('#d6e6ea'),
                // p5.color(255, 0, 0),
                // p5.color(255, 255, 0),

                // p5.color(255, 0, 255),
                // p5.color(0, 0, 255),
            ]

            const soft_hill_gen = (offset = 1) => {
                const sy = p5.sb.random()
                const scatter = [0,0];//p5.sb.random()*0.01,p5.sb.random()*0.01]
                return (x, y) => {
                    return [
                        rotateAroundZAxis(0.1 + p5.sin(x * 3.28 + mouse[0] * 100))
                        , translationMatrix(scatter[0],scatter[1]+ -1.955 + 0.5 * offset, 0)
                        , scaleMatrix(1, 9.125)
                    ]
                }
            }

            const steep_landscape = (offset = 1) => {
                const sy = p5.sb.random() * 0.1
                return (x, y) => {
                    let ss = p5.sin(x * 10.28) * 0.2
                    ss += p5.sin(x * 20.28) * 0.07
                    ss += p5.sin(x * 40.28) * 0.04
                    ss += sy;
                    ss *= 0.25
                    return [
                        // rotateAroundZAxis(0.1 + p5.sin(x * 3.28 + mouse[0] * 100))
                        //+ p5.sin(ss)*0.9+1.0 -1.5
                        translationMatrix(0, Math.pow(x - 0.5, 2), 0)
                        // , scaleMatrix(1, 1.125)
                    ]
                }
            }

            let timeDraw = genTime;

            let hill_offset;
            if(p5.sb.random()>.5){
                console.log('narrow hills')
                 hill_offset = p5.sb.random(4.4, 6.4);    
            }else{
                console.log('wide hills')
                hill_offset = p5.sb.random(4.0, 6.9);
            }
            
            let numLayers = 5;
            const spread = 0.01 // smaller to show more of the layers! 0.01 good
            const chaosFactor = .05252; //smaller is more alignment between layers
            const verticalChaos = .125; // 0.125 less is more straight lines
            const scatterSize = 0.001;
            // todo try different vertical + chaos factors for different layers
            // good between 0 and .5
            const soft_hill_gen2 = (offset) => {
                        const sy = hill_offset * p5.sb.random() * chaosFactor
                        return (x, y) => {
                            let ss = p5.sin(x * 8 + timeDraw) * 0.5
                            ss += p5.sin(x * 16 + timeDraw) * 0.25
                            ss += p5.sin(x * 32 + timeDraw) * 0.125
                            ss += p5.sin(x * 64 + timeDraw) * 0.0625
                            ss *= verticalChaos;
                            ss += sy;
                            
                            const scatter = [p5.sb.random(scatterSize),p5.sb.random(scatterSize)]
                            return [
                                translationMatrix(.5, .5, 0),
                                rotateAroundZAxis(ss),

                                translationMatrix(-0.5, -0.5)
                                // , translationMatrix(0, -1.955+0.5*offset, 0)
                                , translationMatrix(scatter[0],scatter[1]+ spread * offset + -0.75, 0)
                                , scaleMatrix(1, 3.125)
                            ]
                }
            }
            const soft_hill_gen_vertical = (offset) => {
                const sy =hill_offset * p5.sb.random() * chaosFactor
                return (x, y) => {
                    // can make more interesting pattersn if time draw changes
                    let ss = p5.sin(x * 8 + timeDraw*sy) * 0.5
                    ss += p5.sin(x * 16 + timeDraw*sy) * 0.25
                    ss += p5.sin(x * 32 + timeDraw*sy) * 0.125
                    ss += p5.sin(x * 64 + timeDraw*sy) * 0.0625
                    ss *= verticalChaos;
                    ss += sy;
                    const scatter = [p5.sb.random(scatterSize),p5.sb.random(scatterSize)]
                    return [
                        translationMatrix(.5, .5, 0),
                        rotateAroundZAxis(ss),

                        translationMatrix(-0.5, -0.5)
                        // , translationMatrix(0, -1.955+0.5*offset, 0)
                        , translationMatrix(scatter[0],scatter[1]+ spread * offset + -0.75, 0)
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
            const colorsFg = [colors[2], colors[3], colors[3], colors[3]]
            const colorsFg2 = [colors[4], colors[5], colors[5], colors[5]]
            const colorsFg3 = [colors[6], colors[7], colors[7], colors[7]]

            const allColors = [
                [colors[0], colors[1]],
                [colors[2], colors[3], [], []],
                [colors[4], colors[5], [], []],
                [colors[6], colors[7], [], []],
            ];
            let bgLayers = [
                layer(soft_hill_gen2, null, colorFunctions.twoGradientY, colorsBg),
                layer(steep_landscape, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors)),
            ].map((l, i, m) => {
                l.matrix = l.matrix(i, i / m.length);
                return l;
            })
            let layers = [];
            for (let i = 0; i < numLayers; i++) {
                let l;
                // if(Math.floor(numLayers/2)===i){
                //    
                //    
                // }
                // else
                    if(i%2===0){
                     l = layer(    soft_hill_gen_vertical, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors));
                }else{
                    l = layer(soft_hill_gen2, filterFunctions.isY_lt(0.5), colorFunctions.twoGradientY, p5.sb.randomList(allColors));
                }
                l.matrix = l.matrix(i, i / numLayers);
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


            let pointSize= [p5.width*0.001,p5.width*0.004*1.2]
            p5.noStroke();
            // p5.noStroke();
            // p5.strokeWeight(0)
            const drawArc = false;
            const drawPoint = (x,y,color)=>{

                // p5.stroke(0)
                const r = randerRand.random(pointSize[0],pointSize[1])
                // const r2 = randerRand.random(pointSize[0],pointSize[1])
                // p5.noStroke();
                
                if(drawArc){
                    p5.stroke(color)
                    p5.noFill()
                    const sa = randerRand.random(0.0, p5.TWO_PI)
                    randerRand.random()
                    const ea = randerRand.random(0.0, p5.TWO_PI)
                    p5.arc(x,y,r,r, sa, ea)   
                }else{

                    const r = randerRand.random(pointSize[0],pointSize[1])
                    p5.noStroke();
                    p5.fill(color)
                    p5.ellipse(x,y,r)
                    
                }
                // p5.set(x, y, color)
            }
            const renderFn = (x, y) => {
                let p, color;

                p = null;
                color = null
                for (let layer of layers) {
                    p = mappingFunctions.matrix_apply(p5, x, y, layer.matrix)
                    if (layer.filter && !!p) p = filterFunctions.filter_apply(p5, p, layer.filter)
                    if (p) color = layer.color(p5, p, layer.colors)
                    if (color) {
                        drawPoint(x,y,color)
                        break;
                    }
                }

                p = null;
                let bgColor  = null
                for (let layer of bgLayers) {
                    p = mappingFunctions.matrix_apply(p5, x, y, layer.matrix)
                    if (layer.filter && !!p) p = filterFunctions.filter_apply(p5, p, layer.filter)
                    if (p) bgColor = layer.color(p5, p, layer.colors)
                    if (bgColor) {
                        // drawPoint(x,y,color)
                        // break;
                    }
                }
                if(!color){
                    drawPoint(x,y,bgColor)
                }
            }

            if (renderStyle === 1) {
                // p5.loadPixels()
                let numRender = Math.min(pixelsToDrawn.length, 30000)
                for (let i = 0; i < numRender; i++) {
                    let index = randerRand.randomInt(0, pixelsToDrawn.length)
                    let drawi = pixelsToDrawn[index]
                    pixelsToDrawn[index] = null
                    // let j = sb.randomInt(0,numRender)
                    let x = drawi % p5.width;
                    let y = (drawi - x) / p5.width;

                    renderFn(x, y)

                }

                // p5.updatePixels()
                var i = pixelsToDrawn.length
                let numDeleted = 0;
                while (i--) {

                    if (pixelsToDrawn[i] === null) {
                        pixelsToDrawn.splice(i, 1);
                        numDeleted++;
                    }
                }
                // pixelsToDrawn= pixelsToDrawn.filter(i=>i!==null)
                console.log(pixelsToDrawn.length, numDeleted)


                // console.log({maxSs})
                if (pixelsToDrawn.length === 0) {

                    p5.noLoop()

                    window.attributes = ({'hello': 'stew'});
                    window.previewReady = 1;
                    // console.log("finished draw")
                }
            } else if (renderStyle === 0) {
                // p5.loadPixels()
                //.004 is the render speed
                let speed = 1.125;
                let numRender = Math.floor(.004 * speed * p5.width * p5.height);
                for (let i = 0; i < numRender; i++) {
                    let x = randerRand.randomInt(0, p5.width);
                    randerRand.random();
                    let y = randerRand.randomInt(0, p5.height);
                    renderFn(x, y)
                }

                // p5.updatePixels()
            }
            if(renderCount++ === 150){
                p5.noLoop()
            }


            // console.log({previewReady})

        };
    }
;

document.addEventListener('previewReady', () => {
    console.log("PREVIEW READY")
})
new p5(sketch);
