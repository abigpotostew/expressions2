export function nestedToObject(nested){
    return nested.map((pair)=>({x:pair[0],y:pair[1]}))
}

export function objectToNested(xys){
    return xys.map((o)=>([o.x,o.y]))
}