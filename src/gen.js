export const clamp = (v,lo=0,hi=1)=>{
    return Math.min(hi, Math.max(lo,v));
}
export const mapColor=(p5,value,colors)=>{
    if(value>1 || value<0) throw new Error('invalid range: '+value)
    let n = colors.length
    const iter =1/n; 
    const between =iter*0.5; 
    for (let i = 1; i < n; i++) {
        if(value<=i*iter){
            let t = p5.map(value, (i-1)*iter,(i*iter), 0, 1);// ((i*iter) - (i-1)*iter)/iter * value
            return p5.lerpColor(colors[i-1], colors[i], t)
            // return colors[ii]
        }
    }
    return colors[colors.length-1]
}