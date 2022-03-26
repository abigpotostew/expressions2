// import P5 from "p5";
import p5 from "p5";
// import "p5/lib/addons/p5.dom";
// // import "p5/lib/addons/p5.sound";	// Include if needed
// import "./styles.scss";
// import Quadtree from "quadtree-lib";
// Creating the sketch itself
import {
    genColorSteppedLine,
    genColorSteppedNoiseWalkerLine,
    genEye,
    genHand,
    genInlaidLine,
    genLightLanguage,
    World
} from "./gen.js"
import {ColorScheme} from "./color.js"
import {PRNGRand} from "./random";
import {getFeatures} from "./features";
import {parseBodyPartsSvg, parseLightLanguageSvg} from "./data";
import polygonClipping from "polygon-clipping";
import {randomPolygon} from "./polygon/random-polygon";
import {positionToBounds} from "./polygon/boundingbox";

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
                seed = new Date().getTime();
            }
            p5.sb = new PRNGRand(seed)

            // let settings = getFeatures(p5.sb);

            // console.log("seed", seed)
            p5.randomSeed(seed);
            p5.noiseSeed(seed);

            resetPolys()
            // const poly1 = [[[0, 0], [2, 0], [0, 2], [0, 0]].map(p => [p[0] * 100 + p5.mouseX, p[1] * 100 + p5.mouseY])]
            // const poly2 = [[[-1, 0], [1, 0], [0, 1], [-1, 0]].map(p => [p[0] * 100 + 200, p[1] * 100 + 200])]
            // const clipped = polygonClipping.xor(poly1, poly2)
            // polys.fill.push(clipped)
            // polys.outline.push(poly1, poly2)

            const generateShape = ({parent, x, y}) => {
                //takes flat array of object {x,y} points and returns a polygon
                const bb = parent?.getBoundingBox() || positionToBounds({
                    x: x||p5.sb.randomInt(p5.width * .25, p5.width * .75),
                    y: y||p5.sb.randomInt(p5.height * .25, p5.height * .75),
                    w: p5.sb.randomInt(p5.width * .25, p5.width * .5) ,
                    h: p5.sb.randomInt(p5.height * .25,p5.height * .5),
                })
                return randomPolygon(p5.sb, bb, {resolution: p5.sb.randomInt(20,300), insidePoints: parent?.points})
            }

            const genEye=(x,y)=>{
                let prev;
                let i=p5.sb.randomInt(3, 30);
                do{
                    prev = generateShape({parent:prev, x,y})
                    polys.drawable.push(prev)
                }while(i--)
            }
            let x=p5.width * .25;//p5.sb.randomInt(p5.width * .25, p5.width * .5);
            let y = p5.height * .25;
            genEye(x,y)
            genEye(p5.width-x,y)
            genEye(p5.width*.5,p5.height-y)
            
            // polys.drawable.push(generateShape())
            // polys.drawable.push(generateShape(polys.drawable[0])) 


        };


        let canvas; //p5 canvas
        p5.setup = () => {
            // Creating and positioning the canvas
            const s = Math.min(p5.windowHeight, p5.windowWidth) * .9
            canvas = p5.createCanvas(s, s); // p5.windowWidth, p5.windowHeight);


            // document.getElementById("download-canvas").addEventListener("click", function () {
            //     console.log('click')
            //     p5.saveCanvas(canvas, "shaman", "png");
            //     return false;
            // }, false);
            //     .onclick = (e) => {
            //     // e.preventDefault()
            //
            // }


            p5.pixelDensity(2)
            p5.colorMode(p5.HSB)
            canvas.parent("sketch");

            const seedQp = new URL(window.location.href).searchParams.get("seed")

            if (seedQp) {
                seed = seedQp;
            }
            gen(!seedQp);
        };

        p5.keyReleased = () => {
            if (p5.key === ' ') {
                gen(true)
                p5.loop()
            }
            if (p5.key === 's') {
                p5.saveCanvas(canvas, "weave-" + seed, "png");
            }
            if(p5.key==='d'){
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
            const s = Math.min(p5.windowHeight, p5.windowWidth) * .9
            p5.resizeCanvas(s, s);
            needsRender = true
            gen(false)
        };
        p5.draw = () => {
            p5.background(...p5.sb.randomRgb());
            millis = millis + 1 / p5.frameRate();
            // console.log(p5.frameRate());

            document.getElementById("fps").innerText = p5.frameRate().toFixed(0);

            gen(false)


            const drawPoly = (pg, outlineOnly) => {
                if (!Number.isFinite(pg[0]?.[0])) {
                    pg.forEach(drawPoly)
                }
                p5.beginShape()
                for (let p of pg) {
                    p5.vertex(p[0], p[1])
                }
                p5.endShape(p5.CLOSE)
            }
            p5.stroke(0, 0, 255)
            p5.push()

            p5.noFill()

            // polys.forEach(p=>drawPoly(p))
            polys.outline.forEach(drawPoly)
            // poly2.forEach(drawPoly)
            p5.fill(255)
            polys.fill.forEach(drawPoly)
            p5.pop()

            if (polys.fill.length) {

                setdebugArea(polys.fill[0].length)
                if( polys.fill[0].length === 1)
                console.log("clipped", polys.fill[0])
            }
            //
            // polys.drawable.slice().reverse().forEach(p => {
            //     p.draw(p5)
            // })
            polys.drawable.forEach(p => p.draw(p5))
            
            p5.noLoop()

        };
    }
;

new p5(sketch);
