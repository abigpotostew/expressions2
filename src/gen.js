import {multiply, rotateAroundZAxis, scaleMatrix, translationMatrix} from "./matrix/matrix";

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
    value = clamp(value)
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

const cos = (p5, v) => p5.cos(v)
const sin = (p5, v) => p5.sin(v)

const hills = (p5, x, y) => {
    x = (x / p5.width)
    y = (y / p5.height)
    let v = 0;

    const dist = p5.dist(x, y, 0, 0);
    const scalar = (0.5 - dist) * 200.0;
    // const p = multiply([
    //     rotateAroundZAxis(dist * (p5.normalizedMouse[0] * scalar) * 1.1),
    // ], [x, y]);
    const p = multiply([rotateAroundZAxis(0.1 + p5.sin(x * 6.28))], [x, y])

    let yi = (p[1]) * 6.28318531;

    const n = 2;
    v += p5.sin(yi)
    v += sin(p5, yi * 4)
    // v+= sin(p5, yi*4)
    // v+= sin(p5, yi*8)
    let vf = (v / (n * 2)) + 0.5
    vf = (vf - 0.5) * 4.0;
    if (vf < 0) {
        return [p[0], 0]
    }
    if (vf < 0 || vf > 1) {
        // throw new Error('blargh out of range')
        return null;
    }
    let my = clamp(vf);//(p[1] + vf)*0.5;
    return [p[0], my];
}

const matrix_apply = (p5, x, y, getMatrix) => {
    x = (x / p5.width)
    y = (y / p5.height)

    const p = multiply(getMatrix(x, y), [x, y])
    // if(p[1] < 0.5) return null;
    return p;
    // return [p[1],p[0]];
}

const isY_gt = (v) => {
    return (p) => {
        return p[1] >= v;
    }
}


const isY_lt = (v) => {
    return (p) => {
        return p[1] < v;
    }
}

export const filter_apply = (p5, p, fn) => {
    if (fn(p)) {
        return p;
    }
    return null;
}
const hills_simple = (p5, x, y) => {
    x = (x / p5.width)
    y = (y / p5.height)

    const p = multiply([rotateAroundZAxis(0.1 + p5.sin(x * 3.28))
        , translationMatrix(0, -1.05, 0)
        , scaleMatrix(1, 5.125)
    ], [x, y])

    // if(p[1] < 0.5) return null;
    return p;
}

export const mappingFunctions = {
    swirl,
    hills,
    hills_simple,
    matrix_apply,
}
export const filterFunctions = {
    filter_apply,
    isY_gt,
    isY_lt
}

const twoGradientY = (p5, p, colors) => {
    return mapColorPairs(p5, p[1], colors);
}

const twoGradientYRandomScatter = (p5, p, colors) => {
    return mapColorPairs(p5, p5.sb.random()*p[1], colors);
}

const twoGradientYRandomScatter_factory = (noise) => {
    return (p5, p, colors)=>{
        return mapColorPairs(p5, noise(p[1]), colors);
    }
}

let range = [1000,-1000]
const noiseOverlay_factory = (noise2DFieldOverlay, colorFunc) => {
    return (p5, p, colors)=>{
        let color = colorFunc(p5,p,colors)
        if(!color) return color;
        const p1 = [...p].map(p=>20*p);
        const p2 = [...p1].map(p=>1*p + 100000);
        let n = noise2DFieldOverlay(p1[0],p1[1])*1
        let n2 =noise2DFieldOverlay(p2[0],p2[1])*1
        n = n+n2;
        let ran=[.5,1.5]
        if(n<range[0]){
            range[0]=n
        }
        if(n>range[1]){
            range[1]=n
        }
        if(n > ran[0] && n < ran[1]) {
            let edge = .9;
            n = p5.map(n,ran[0],ran[1],0,1)
            if(n<.8){
                n = p5.map(n,0,edge,0,1)
            }else{
                n = 1-p5.map(n,edge,1,0,1)
            }
            color = p5.lerpColor(color, p5.color(0), n)
        }
        return color;
    }
}




const debug = (p5, p, colors) => {
    return p5.color(
        clamp(p[0]) * 255,
        0,
        clamp(p[1]) * 255
    )
}

export const colorFunctions = {
    twoGradientY, debug,
    twoGradientYRandomScatter,
    twoGradientYRandomScatter_factory,
    noiseOverlay_factory
}
