export const fbmFactory = (p5, noise, octaves=1,lacunarity=2,gain=0.5)=>{
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