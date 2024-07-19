var _a;
export class Career {
    constructor(equipment_loot, id, raw_text) {
        this.equipment_loot = equipment_loot;
        this.id = id;
        this.raw_text = raw_text;
    }
}
_a = Career;
Career.Warrior = new Career([
    ['template/weapon/melee_weapon', 2],
    ['template/weapon/melee_weapon', 2],
    ['template/weapon/melee_weapon', 2]
], "", "");
//public static readonly Archer = new Career();
//public static readonly Wizard = new Career();
Career.allCareers = [_a.Warrior /*,this.Archer,this.Wizard*/];
//# sourceMappingURL=Career.js.map