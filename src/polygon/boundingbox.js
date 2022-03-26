export class BoundingBox{
    constructor({l,t,b,r}) {
        this.l = l;
        this.t = t;
        this.b = b;
        this.r = r;
    }
}
export const positionToBounds = ({x,y,w,h})=>{
    return new BoundingBox({
        l: x - w/2,
        t: y - h/2,
        r: x+w/2,
        b: y+w/2
    })
}