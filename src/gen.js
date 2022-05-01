import {multiply, rotateAroundZAxis} from "./matrix/matrix";

export const clamp = (v, lo = 0, hi = 1) => {
    return Math.min(hi, Math.max(lo, v));
}
export const mapColor = (p5, value, colors) => {
    if (value > 1 || value < 0) throw new Error('invalid range: ' + value)
    let n = colors.length
    const iter = 1 / n;
    const between = iter * 0.5;
    for (let i = 1; i < n; i++) {
        if (value < i * iter) {
            let t = p5.map(value, (i - 1) * iter, (i * iter), 0, 1);// ((i*iter) - (i-1)*iter)/iter * value
            return p5.lerpColor(colors[i - 1], colors[i], t)
            // return colors[ii]
        }
    }
    return colors[colors.length - 1]
}
export const mapColorPairs = (p5, value, colors) => {
    if (colors.length % 2 !== 0) throw new Error('must be even number of colors')
    // if (value > 1 || value < 0) throw new Error('invalid range: ' + value)
    value=clamp(value)
    let n = colors.length / 2;
    const iter = 1 / n;
    for (let i = 1; i <= n; i++) {
        if (value < i * iter) {
            let t = p5.map(value, (i - 1) * iter, (i * iter), 0, 1);// ((i*iter) - (i-1)*iter)/iter * value
            return p5.lerpColor(colors[2 * i - 2], colors[2 * i - 1], t)
            // return colors[ii]
        }
    }
    return colors[colors.length - 1]
}

const swirl = (p5, x, y) => {
    let xi = (x / p5.width - 0.5) * 2.0
    let yi = (y / p5.height - 0.5) * 2.0
    const dist = p5.dist(x, y, 0, 0);
    const scalar = (0.5 - dist) * 200.0;
    const p = multiply([
        rotateAroundZAxis(dist * (p5.normalizedMouse[0] * scalar) * 1.1),
    ], [x, y]);
    return p;
}

const cos = (p5,v)=> p5.cos(v)
const sin = (p5,v)=> p5.sin(v)

const hills =  (p5, x, y) => {
     x = (x / p5.width ) 
     y = (y / p5.height) 
    let v = 0;
    
    const dist = p5.dist(x, y, 0, 0);
    const scalar = (0.5 - dist) * 200.0;
    // const p = multiply([
    //     rotateAroundZAxis(dist * (p5.normalizedMouse[0] * scalar) * 1.1),
    // ], [x, y]);
    const p = multiply([rotateAroundZAxis(0.3 + p5.sin(x*6.28))], [x,y])
    
    let yi = (p[1])*6.28318531;

    const n = 2;
    v+= p5.sin(yi)
    v+= sin(p5, yi*2)
    // v+= sin(p5, yi*4)
    // v+= sin(p5, yi*8)
    const vf = (v/(n*2))+0.75
    if(vf<0||vf>1){
        // throw new Error('blargh out of range')
    }
    let my = clamp(vf);//(p[1] + vf)*0.5;
    return [p[0],my];
} 

export const mappingFunctions = {
    swirl,
    hills
}

const twoGradientY = (p5, p, colors)=>{
   return mapColorPairs(p5, p[1], colors);
}


const debug = (p5, p, colors)=>{
    return p5.color(
        clamp(p[0])*255,
        0,
        clamp(p[1])*255
    )
}

export const colorFunctions = {
    twoGradientY, debug
}
