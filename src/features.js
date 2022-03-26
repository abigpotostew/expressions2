export class Features {

    constructor(features) {
        this.features = features
        this.keys = Object.keys(this.features).sort()
    }

    angles(isAngle) {
        if (isAngle) {
            return this.features.angles === isAngle
        }
        return this.features.angles
    }

    eyes(isEye) {
        if (isEye) {
            return this.features.eyes === isEye
        }
        return this.features.eyes
    }

    toString() {
        let str = ''
        for (let key of this.keys) {
            str = str + '\n' + key + ': ' + this.features[key]
        }
        return str
    }

    largeMode() {
        return this.features.largeMode
    }

    wiggleMode() {
        return this.features.wiggleMode
    }

    lineMode(isLineMode) {
        if (isLineMode) {
            return this.features.lineMode === isLineMode
        }
        return this.features.lineMode
    }
}

export const lineModes = {
    strips: 'Regular',
    inlet: 'Inlet',
}

export const angleModes = {
    horizontal: 'Horizontal',
    instectoidAngry: 'Insectoid',
    downwards: "Downwards"
}


export const eyeModes = {
    hypnotizedCircles: 'Hypnotized',
    hypnotizedWavy: 'Hypnotized Wavy',
    mask: 'Mask'
}

const randomFrom = (r, set) => {
    return set[r.randomInt(0, set.length)]
}

const getAngleMode = (r) => {
    return randomFrom(r, [angleModes.horizontal, angleModes.instectoidAngry, angleModes.downwards])
}

const getEyeMode = (r) => {
    return randomFrom(r,
        // [eyeModes.hypnotizedCircles, eyeModes.hypnotizedWavy, eyeModes.mask]
        [eyeModes.hypnotizedCircles, eyeModes.mask]
        // [eyeModes.mask]
    )
}

const getLineMode = (r) => {
    return randomFrom(r, [lineModes.inlet, lineModes.strips])
}

export const getFeatures = (r) => {
    const features = {
        angles: getAngleMode(r),
        eyes: getEyeMode(r),
        largeMode: r.random() < .5,
        wiggleMode: r.random() < .5,
        lineMode: getLineMode(r)
    }
    return new Features(features)
}
