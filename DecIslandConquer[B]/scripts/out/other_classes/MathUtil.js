export class MathUtil {
    static randomInteger(min, max) {
        let length = Math.floor(Math.random() * (max - min + 1));
        return min + length;
    }
    static max(target_arr) {
        let max = 0;
        for (let n of target_arr) {
            if (n > max) {
                max = n;
            }
        }
        return max;
    }
}
//# sourceMappingURL=MathUtil.js.map