import {noiseFactory} from "./perlin";

export const fbmFactory = (p5, noise, octaves=1,lacunarity=2,gain=0.5)=>{
    if(!noise){
        noise = noiseFactory()
        noise.seed(p5.sb.randomInt(0, Number.MAX_SAFE_INTEGER))
    }
    return (x, offset=0)=>{
        let amplitude = 0.5;
        let frequency = 1.;
        let y = 0;
        for (let i = 0; i < octaves; i++) {
            const n=noise.simplex2(frequency*x + offset, offset);
            y += amplitude * n;
            frequency *= lacunarity;
            amplitude *= gain;
        }
        return y;
    } 
    
    
}