import { ItemStack, Player } from "@minecraft/server";
import Random from "../other_classes/Random.js";
import lootFileSystem from "./lootFileSystem.js";

export class LootTableEngine {
    static fileSystem = lootFileSystem
    rand = new Random()
    constructor(public randGenerate: Random) {

    }

    give(pl:Player,loot:LootTable|string){
        if(typeof loot === "string"){
            loot = (lootFileSystem as any)[loot]
        }
        this.loot(loot as LootTable).forEach(i => {
            //console.warn(i.nameTag)
            pl.getComponent('inventory')?.container?.addItem(i)
        })
    }
    loot(loot: LootTable) {
        let items: ItemStack[] = []
        this.rand = new Random(this.randGenerate.nextInt())
        this.handleLoot(loot, items)
        return items
    }

    handleLoot(loot: LootTable, items: ItemStack[]) {
        loot.pools.forEach(e => this.handlePool(e, items))
    }
    handlePool(pool: Pool, items: ItemStack[]) {
        let map: { [k: string]: number } = {}
        pool.entries.forEach((e, i) => map[i + ""] = e.weight ?? 1)

        for (let i = 0; i < pool.rolls; i++) {
            let index = parseInt(this.random_choose(map))

            let entry = pool.entries[index]
            if (entry.type === "item") {
                let amount = 1;
                if (entry.functions) {
                    amount = Math.floor(entry.functions[0].count.min + this.randGenerate.next() * (entry.functions[0].count.max - entry.functions[0].count.min + 1))
                }


                items.push(new ItemStack(entry.name, amount))
            } else if (entry.type === "loot_table") {
                let loot: LootTable = (<any>LootTableEngine.fileSystem)[entry.name as any]
                this.handleLoot(loot, items)
            }
        }


    }
    random_choose(para: { [k: string]: number }) {
        let arr = new Array<[string, number]>
        for (let k of Object.keys(para)) {
            for (let i = 0; i < para[k]; i++) {
                arr.push([k, para[k]])
            }
        }
        return arr[Math.floor(this.randGenerate.next() * arr.length)][0]
    }
}


export interface Pool {
    rolls: number
    entries: Entrie[]
}
export interface Entrie {
    functions?: [{ "function": "set_count", "count": { "min": number, "max": number } }]
    name: string
    type: "item" | "loot_table"
    weight?: number
    pools?: Pool[]
}
export interface LootTable {
    pools: Pool[]
}