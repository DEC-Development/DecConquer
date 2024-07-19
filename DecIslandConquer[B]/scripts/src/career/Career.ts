export class Career{

    public static readonly Warrior = new Career(
        [
            ['template/weapon/melee_weapon',2],
            ['template/weapon/melee_weapon',2],
            ['template/weapon/melee_weapon',2]
        ],"",""
    );
    //public static readonly Archer = new Career();
    //public static readonly Wizard = new Career();
    public static readonly allCareers = [this.Warrior/*,this.Archer,this.Wizard*/]
    
    constructor(public equipment_loot: EquipmentLoot[],public id:string,public raw_text:string){

    }
    
}

export type EquipmentLoot= [string,number]