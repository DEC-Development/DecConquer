import { ItemStack } from "@minecraft/server";
import Random from "../other_classes/Random.js";
import lootFileSystem from "./lootFileSystem.js";
export class LootTableEngine {
    constructor(randGenerate) {
        this.randGenerate = randGenerate;
        this.rand = new Random();
    }
    give(pl, loot) {
        if (typeof loot === "string") {
            loot = lootFileSystem[loot];
        }
        this.loot(loot).forEach(i => {
            var _a, _b;
            //console.warn(i.nameTag)
            (_b = (_a = pl.getComponent('inventory')) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.addItem(i);
        });
    }
    loot(loot) {
        let items = [];
        this.rand = new Random(this.randGenerate.nextInt());
        this.handleLoot(loot, items);
        return items;
    }
    handleLoot(loot, items) {
        loot.pools.forEach(e => this.handlePool(e, items));
    }
    handlePool(pool, items) {
        let map = {};
        pool.entries.forEach((e, i) => { var _a; return map[i + ""] = (_a = e.weight) !== null && _a !== void 0 ? _a : 1; });
        for (let i = 0; i < pool.rolls; i++) {
            let index = parseInt(this.random_choose(map));
            let entry = pool.entries[index];
            if (entry.type === "item") {
                let amount = 1;
                if (entry.functions) {
                    amount = Math.floor(entry.functions[0].count.min + this.randGenerate.next() * (entry.functions[0].count.max - entry.functions[0].count.min + 1));
                }
                items.push(new ItemStack(entry.name, amount));
            }
            else if (entry.type === "loot_table") {
                let loot = LootTableEngine.fileSystem[entry.name];
                this.handleLoot(loot, items);
            }
        }
    }
    random_choose(para) {
        let arr = new Array;
        for (let k of Object.keys(para)) {
            for (let i = 0; i < para[k]; i++) {
                arr.push([k, para[k]]);
            }
        }
        return arr[Math.floor(this.randGenerate.next() * arr.length)][0];
    }
}
LootTableEngine.fileSystem = lootFileSystem;
//# sourceMappingURL=Loot.js.map