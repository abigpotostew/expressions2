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

class RandomAB {
    constructor(hash) {
        this.useA = false;
        let sfc32 = function (uint128Hex) {
            let a = parseInt(uint128Hex.substr(0, 8), 16);
            let b = parseInt(uint128Hex.substr(8, 8), 16);
            let c = parseInt(uint128Hex.substr(16, 8), 16);
            let d = parseInt(uint128Hex.substr(24, 8), 16);
            return function () {
                a |= 0; b |= 0; c |= 0; d |= 0;
                let t = (((a + b) | 0) + d) | 0;
                d = (d + 1) | 0;
                a = b ^ (b >>> 9);
                b = (c + (c << 3)) | 0;
                c = (c << 21) | (c >>> 11);
                c = (c + t) | 0;
                return (t >>> 0) / 4294967296;
            };
        };
        // seed prngA with first half of tokenData.hash
        this.prngA = new sfc32(hash.substr(2, 32));
        // seed prngB with second half of tokenData.hash
        this.prngB = new sfc32(hash.substr(34, 32));
        for (let i = 0; i < 1e6; i += 2) {
            this.prngA();
            this.prngB();
        }
    }
    // random number between 0 (inclusive) and 1 (exclusive)
    random_dec() {
        this.useA = !this.useA;
        return this.useA ? this.prngA() : this.prngB();
    }
    // random number between a (inclusive) and b (exclusive)
    random_num(a, b) {
        return a + (b - a) * this.random_dec();
    }
    // random integer between a (inclusive) and b (inclusive)
    // requires a < b for proper probability distribution
    random_int(a, b) {
        return Math.floor(this.random_num(a, b + 1));
    }
    // random boolean with p as percent liklihood of true
    random_bool(p) {
        return this.random_dec() < p;
    }
    // random value in an array of items
    random_choice(list) {
        return list[this.random_int(0, list.length - 1)];
    }
}


export class PRNGRand {
    constructor(seed) {
        seed = seed.toString()
        const ab = new RandomAB(seed)
        this.grand = ()=>{
            return ab.random_dec()
        }
        // this.grand = new Alea(seed)
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
        return Math.round(this.random(lo, hi))
    }

    randomList(list) {
        return list[this.randomInt(0, list.length - 1)]
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

// export const grand = new PRNGRand(Date.now())
// export default grand

