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
    }

    random(lo, hi) {
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
}

export const grand = new PRNGRand(Date.now())
export default grand

