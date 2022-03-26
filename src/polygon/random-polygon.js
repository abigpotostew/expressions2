import convexhull from "./convex-hull";
import {findPointInPolygon, pointInPolygon} from "./point-in-polygon";
import {BoundingBox} from "./boundingbox";

export class PolygonXY{
    constructor(points, options){
        this.options= options || {};
        this.points = points;
        this.bb = new BoundingBox(points.reduce((bb, p)=>{
            if(p.x<bb.l) bb.l= p.x;
            if(p.x>bb.r) bb.r= p.x;
            if(p.y<bb.t) bb.t= p.y;
            if(p.y>bb.b) bb.b= p.y;
            return bb;
        }, {l:Number.MAX_SAFE_INTEGER,r:Number.MIN_SAFE_INTEGER,t:Number.MAX_SAFE_INTEGER,b:Number.MIN_SAFE_INTEGER}));
    }
    draw(p5){
        //
        p5.push()
        
        if(p5.debugDraw) {
            p5.noFill();
            p5.stroke(255);
            p5.strokeWeight(1);
            p5.beginShape();
            p5.vertex(this.bb.l, this.bb.t);
            p5.vertex(this.bb.r, this.bb.t);
            p5.vertex(this.bb.r, this.bb.b);
            p5.vertex(this.bb.l, this.bb.b);
            p5.endShape(p5.CLOSE);
        }
        
        let color = 255;
        if(this.options.fill)
        {color = p5.color(...this.options.fill)}
        if(this.options.noStroke){p5.noStroke()}
        
        p5.fill(color);
        p5.beginShape();
        for(let i = 0; i < this.points.length; i++){
            p5.vertex(this.points[i].x, this.points[i].y);
        }
        p5.endShape(p5.CLOSE);
        p5.pop()
    }
    getBoundingBox(){
        return this.bb;
    }
}

export const randomPolygon = (sb, {t,b,l,r}, {resolution, insidePoints})=>{
    resolution = resolution || 100;
    const points = [];
    while(resolution--){
        if(insidePoints){
            points.push(findPointInPolygon(sb, {t,b,l,r}, insidePoints))
        }else{
            points.push({x:sb.randomInt(l,r), y:sb.randomInt(t,b)});
        }
    }
    const hull = convexhull.makeHull(points)
    return new PolygonXY(hull, {fill:sb.randomRgb(), noStroke:true});
}

