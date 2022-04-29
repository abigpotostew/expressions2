export function findPointInPolygon(sb, bb, vs, start, end) {
    let point;
    let points = [];
    let iterations = 100;

    // for (let i = 0; i <iterations; i++) {
    //     point = [sb.randomInt(bb.l, bb.r), sb.randomInt(bb.t, bb.b)]
    //     if(pointInPolygon(point, vs, start, end)){
    //        break 
    //     }else if(i === iterations - 1){
    //         throw new Error('Could not find point in polygon');
    //     }
    // }

    // have to call random fixed number of times.
    for (let i = 0; i < iterations; i++) {
        points.push([sb.random(bb.l, bb.r), sb.random(bb.t, bb.b)]);
        // points.push([sb.randomInt(Math.floor(bb.l), Math.ceil(bb.r)), sb.randomInt(Math.floor(bb.t), Math.ceil(bb.b))]);
    }

    
    for (let i = 0; i < points.length; i++) {
        point = points[i];
        // console.log('tests ',i)
        if (pointInPolygon(point, vs, start, end)) {
            break
        } else if (i === iterations - 1) {
            throw new Error('Could not find point in polygon');
        }
    }
    // do {
    //     point = [sb.randomInt(bb.l, bb.r), sb.randomInt(bb.t, bb.b)]
    // }while(!pointInPolygon(point, vs, start, end) && iterations--);
    // if(iterations === 0) {
    //     throw new Error('Could not find point in polygon');
    // }
    return {x: point[0], y: point[1]};
}

export function pointInPolygon(point, vs, start, end) {
    if (vs.length > 0 && Array.isArray(vs[0])) {
        return pointInPolygonNested(point, vs, start, end);
    } else if (vs.length > 0 && typeof vs[0] === 'object') {
        return pointInPolygonObject(point, vs, start, end);
    } else {
        return pointInPolygonFlat(point, vs, start, end);
    }
}

function pointInPolygonFlat(point, vs, start, end) {
    var x = point[0], y = point[1];
    var inside = false;
    if (start === undefined) start = 0;
    if (end === undefined) end = vs.length;
    var len = (end - start) / 2;
    for (var i = 0, j = len - 1; i < len; j = i++) {
        var xi = vs[start + i * 2 + 0], yi = vs[start + i * 2 + 1];
        var xj = vs[start + j * 2 + 0], yj = vs[start + j * 2 + 1];
        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function pointInPolygonNested(point, vs, start, end) {
    var x = point[0], y = point[1];
    var inside = false;
    if (start === undefined) start = 0;
    if (end === undefined) end = vs.length;
    var len = end - start;
    for (var i = 0, j = len - 1; i < len; j = i++) {
        var xi = vs[i + start][0], yi = vs[i + start][1];
        var xj = vs[j + start][0], yj = vs[j + start][1];
        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function pointInPolygonObject(point, vs, start, end) {
    var x = point[0], y = point[1];
    var inside = false;
    if (start === undefined) start = 0;
    if (end === undefined) end = vs.length;
    var len = end - start;
    for (var i = 0, j = len - 1; i < len; j = i++) {
        var xi = vs[i + start].x, yi = vs[i + start].y;
        var xj = vs[j + start].x, yj = vs[j + start].y;
        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}