const re = /[LMZ]/

const parsePoints = (svg) =>
    svg.split(re)
        .filter(p => !!p)
        .map(p => p.split(','))
        .map(pair => ({
            x: parseFloat(pair[0]),
            y: parseFloat(pair[1])
        }))


const parseMultiPartShape = (svgs, scale) => {
    let l = Number.MAX_SAFE_INTEGER
    let r = Number.MIN_SAFE_INTEGER;
    let t = Number.MAX_SAFE_INTEGER;
    let b = Number.MIN_SAFE_INTEGER;

    const pointsArray = svgs.map(parsePoints)
    const pointsFlat = pointsArray.flat()
    //center

    // bounding box around centered shape
    for (let point of pointsFlat) {
        if (point.x < l) l = point.x
        if (point.x > r) r = point.x
        if (point.y < t) t = point.y
        if (point.y > b) b = point.y
    }

    const width = r - l;
    const height = b - t
    const aspect = Math.max(width, height)
    const wAspect = width / aspect;
    const hAspect = height / aspect;

    const out = []
    for (let points of pointsArray) {
        for (const point of points) {
            point.x = ((point.x - l) / aspect - .5 * wAspect) * scale
            point.y = ((point.y - t) / aspect - .5 * hAspect) * scale
        }
        out.push({
            points,
            center: {x: 0, y: 0},
            width: scale * wAspect,
            height: scale * hAspect,
            boundingBox: {
                l: -.5 * wAspect * scale,
                r: .5 * wAspect * scale,
                t: -.5 * hAspect * scale,
                b: .5 * hAspect * scale
            }
        })
    }

    return out
}

const mouthPath = 'M7,83L6,73L10,67L17,64L20,70L24,77L27,84L34,87L40,86L45,81L45,73L44,66L44,61L51,59L58,60L61,66L63,73L64,79L66,81L74,83L83,82L86,73L86,66L87,60L94.025,60.267L96.823,83.527L106.907,83.73L110.403,60.88L117,61L119,68L120,74L123,80L125,82L131,82L141,80L147,72L151,64L152,60L168,64L167,71L168,76L165,85L167,87L178,89L181,86L184,76L185,64L191,63L193,69L191,81L189,98L186,111L181,118L164,122L150,124L144,124L132,125L112,128L105,129L86,129L66,124L55,122L43,120L39,120L9,114L8,112L5,99L5,90L7,83Z'
const mouthOvalPath = 'M70,43L57.615,46.503L44,51L36.564,56.967L30,66L26.471,73.6L25,83L25.384,92.763L28,102L35.252,113.429L42.381,119.807L50,125L60.085,128.7L74.929,131.234L91.214,133.103L106,133L117.507,131.68L127.358,128.694L136.36,126.278L145,122L153.992,112.154L159,103L161.755,91.131L162,81L160.734,73.24L157.742,66.419L151.992,62.268L143.032,55.077L136,50L125,44L112.764,41.187L98,40L84.447,40.413L70,43Z'
const character1 = ['M93,62L98,57L102,51L106,46L110.07,45.023L112,48L112,64L113,73L116,79L120,80L124,80L126,78L125,76L122,75L119,75L116,76L106,81L100,85L90,95L88,99L85,104L82,111L81,119L82,128L85,135L91,138L99,138L109,134L114,128L118,121L118,117', 'M111,94L106,85L101,79L97,75L92,72']


export class VectorShape {
    constructor(points, center, boundingBox, multipart) {
        this.points = points
        this.center = center
        this.boundingBox = boundingBox
        this.multipart = !!multipart
    }

    static create(p5, svgPath, scale) {
        if (typeof svgPath === 'string') {
            const {points, center, boundingBox} = parseMultiPartShape(svgPath, scale)[0]
            return new VectorShape(points, p5.createVector(center.x, center.y), boundingBox, false)
        } else {
            //multi part object
            const vals = parseMultiPartShape(svgPath, scale)
            return new VectorShape(vals.map(v => v.points), p5.createVector(vals[0].center.x, vals[0].center.y), vals[0].boundingBox, true)
        }
    }

    // {x,y}[]
    getPoints() {
        return this.points
    }

    // if multipart then getPoints returns array of array of points
    isMultiPart() {
        return this.multipart
    }

    // {x,y}
    getCenter() {
        return this.center
    }

    // {t, r, b, l}
    getBoundingBox() {
        return this.boundingBox
    }
}

export const mouthPoints = (p5, scale = 1) => VectorShape.create(p5, [mouthPath], scale)
export const mouthOvalPoints = (p5, scale = 1) => VectorShape.create(p5, [mouthOvalPath], scale)

let lightLanguageSvgPathsById = new Map();
let bodyPartsSvgPathsById = new Map();
export const getLightLanguageCharacter = (p5, id, scale) => {
    if (!lightLanguageSvgPathsById.has(id)) {
        throw new Error('no character with id ' + id)
    }
    return VectorShape.create(p5, lightLanguageSvgPathsById.get(id), scale)
}
export const getLightLanguageCharacterIds = () => {
    return Array.from(lightLanguageSvgPathsById.keys())
}

export const parseLightLanguageSvg = (p5, svgXml) => {
    let children = svgXml.getChildren('g');

    for (let i = 0; i < children.length; i++) {
        const group = children[i]
        let id = children[i].getString('id');
        const paths = group.getChildren('path')
        const pathStrings = [];
        for (let j = 0; j < paths.length; j++) {
            const path = paths[j]
            pathStrings.push(path.getString('d'))
        }
        lightLanguageSvgPathsById.set(id, pathStrings)
    }
}

export const getBodyPart = (p5, id, scale) => {
    if (!bodyPartsSvgPathsById.has(id)) {
        throw new Error('no body part with id ' + id)
    }
    return VectorShape.create(p5, bodyPartsSvgPathsById.get(id), scale)
}

export const parseBodyPartsSvg = (p5, svgXml) => {
    let partsGrouped = svgXml.getChildren('g');

    for (let i = 0; i < partsGrouped.length; i++) {
        const group = partsGrouped[i]
        let groupId = partsGrouped[i].getString('id');
        const paths = group.getChildren('path')
        const pathStrings = [];
        for (let j = 0; j < paths.length; j++) {
            const path = paths[j]
            pathStrings.push(path.getString('d'))
        }
        bodyPartsSvgPathsById.set(groupId, pathStrings)
    }
}
