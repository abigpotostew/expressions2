export class BoundingBox{
    constructor({l,t,b,r}) {
        this.l = l;
        this.t = t;
        this.b = b;
        this.r = r;
    }
    //scales around origin
    scale(scalar){
        let w2 = (this.r-this.l)/2;
        let h2 = (this.b-this.t)/2;
        let ol = -w2;
        let or = w2;
        let ot = -h2;
        let ob = h2;
        return new BoundingBox({
            l: ol*scalar + this.l + w2,
            r: or * scalar + this.l + w2,
            t: ot * scalar + this.t + h2,
            b: ob * scalar + this.t + h2,
        })
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