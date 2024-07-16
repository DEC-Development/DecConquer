export class MathUtil {
    static randomInteger(min: number, max: number) {
        let length = Math.floor(Math.random() * (max - min + 1));
        return min + length;
    }
    static max(target_arr: Array<number>) {
        let max = 0
        for (let n of target_arr) {
            if (n > max) {
                max = n
            }
        }
        return max
    }
}