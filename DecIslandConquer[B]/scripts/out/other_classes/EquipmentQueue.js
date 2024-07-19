import { world } from "@minecraft/server";
import { Career } from "../career/Career";
import { LootTableEngine } from "../loot/Loot";
import Random from './Random';
export class EquipmentQueue {
    constructor() {
        this.blueTeamLoot = new Map();
        this.redTeamLoot = new Map();
    }
    gameStartInit() {
        Career.allCareers.forEach(c => {
            var _a, _b;
            let rand1 = new Random();
            let rand2 = new Random();
            rand2.seed = rand1.seed;
            this.blueTeamLoot.set(c, new LootTableEngine(rand1));
            this.redTeamLoot.set(c, new LootTableEngine(rand2));
            world.setDynamicProperty("blue_" + c.id, (_a = this.blueTeamLoot.get(c)) === null || _a === void 0 ? void 0 : _a.randGenerate.seed);
            world.setDynamicProperty("red_" + c.id, (_b = this.redTeamLoot.get(c)) === null || _b === void 0 ? void 0 : _b.randGenerate.seed);
        });
    }
    init() {
        Career.allCareers.forEach(c => {
            var _a, _b;
            let rand1 = new Random();
            let rand2 = new Random();
            rand1.seed = ((_a = world.getDynamicProperty("blue_" + c.id)) !== null && _a !== void 0 ? _a : 0);
            rand2.seed = ((_b = world.getDynamicProperty("red_" + c.id)) !== null && _b !== void 0 ? _b : 0);
            this.blueTeamLoot.set(c, new LootTableEngine(rand1));
            this.redTeamLoot.set(c, new LootTableEngine(rand2));
        });
    }
    give(p, c) {
        var _a;
        if (p.hasTag("team_blue")) {
            if (!this.blueTeamLoot.has(c)) {
                this.blueTeamLoot.set(c, new LootTableEngine(new Random(world.getDynamicProperty("blue_" + c.id))));
            }
            c.equipment_loot.forEach(e => {
                var _a;
                for (let i = 0; i < e[1]; i++) {
                    (_a = this.blueTeamLoot.get(c)) === null || _a === void 0 ? void 0 : _a.give(p, 'loot_tables/' + e[0] + '.json');
                }
            });
            world.setDynamicProperty("blue_" + c.id, (_a = this.blueTeamLoot.get(c)) === null || _a === void 0 ? void 0 : _a.randGenerate.seed);
        }
        else {
        }
    }
}
//# sourceMappingURL=EquipmentQueue.js.map