import arbit from 'arbit';
import Alea from "./prng/Alea";

// export class SbRand {
//     constructor(seed) {
//         this.grand = arbit(seed)
//     }
//
//     random(lo, hi) {
//         if (lo === undefined && hi === undefined) return this.grand.nextFloat()
//         if (hi === undefined && lo !== undefined) {
//             return this.grand.nextFloat() * lo
//         }
//         return this.grand.nextFloat() * (hi - lo) + lo
//     }
//
//     randomInt(lo, hi) {
//         return Math.floor(this.random(lo, hi))
//     }
//
//     seed(seed) {
//         this.grand = arbit(seed)
//     }
// }


export class PRNGRand {
    constructor(seed) {
        seed.toString()
        this.grand = new Alea(seed)
        this.intrand = this.grand.uint32;
        this.debugCounter= 0;
    }

    random(lo, hi) {
        this.debugCounter++;
        if (lo === undefined && hi === undefined) return this.grand()
        if (hi === undefined && lo !== undefined) {
            return this.grand() * lo
        }
        return this.grand() * (hi - lo) + lo
    }

    randomInt(lo, hi) {
        return Math.floor(this.random(lo, hi))
    }

    //
    // seed(seed) {
    //     // this.grand = arbit(seed)
    // }


    randomRgb(){
        return [
            this.random(255),
            this.random(255) ,
            this.random(255) ]
    }
    randomWeighted  (map)  {
        const keys = Array.from(map.keys());
        // let totalSum=0;
        // for (let key of keys) {
        //     totalSum+= map.get(key)
        // }
        const totalSum = keys.reduce((acc, item) => acc + map.get(item), 0);

        let runningTotal = 0;
        const cumulativeValues = keys.map((key) => {
            const relativeValue = map.get(key)/totalSum;
            const cv = {
                key,
                value: relativeValue + runningTotal
            };
            runningTotal += relativeValue;
            return cv;
        });

        const r = this.random();
        return cumulativeValues.find(({ key, value }) => r <= value).key;
    };
}

export const grand = new PRNGRand(Date.now())
export default grand

