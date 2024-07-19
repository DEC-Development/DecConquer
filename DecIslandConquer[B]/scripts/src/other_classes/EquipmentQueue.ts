import { Player, world } from "@minecraft/server";
import { Career } from "../career/Career";
import { LootTableEngine } from "../loot/Loot";
import Random from './Random';

export class EquipmentQueue{
    blueTeamLoot = new Map<Career,LootTableEngine>()
    redTeamLoot = new Map<Career,LootTableEngine>()

    constructor(){}

    gameStartInit(){
        Career.allCareers.forEach(c=>{
            let rand1 = new Random()
            let rand2 = new Random()
            rand2.seed = rand1.seed;

            this.blueTeamLoot.set(c,new LootTableEngine(rand1));
            this.redTeamLoot.set(c,new LootTableEngine(rand2));

            world.setDynamicProperty("blue_"+c.id,this.blueTeamLoot.get(c)?.randGenerate.seed);
            world.setDynamicProperty("red_"+c.id,this.redTeamLoot.get(c)?.randGenerate.seed);
        })
    }
    init(){
        Career.allCareers.forEach(c=>{
            let rand1 = new Random()
            let rand2 = new Random()
            rand1.seed = (world.getDynamicProperty("blue_"+c.id)??0) as number;
            rand2.seed = (world.getDynamicProperty("red_"+c.id)??0) as number;

            this.blueTeamLoot.set(c,new LootTableEngine(rand1));
            this.redTeamLoot.set(c,new LootTableEngine(rand2));
        })
    }
    give(p:Player,c:Career){
        if(p.hasTag("team_blue")){
            if(!this.blueTeamLoot.has(c)){
                this.blueTeamLoot.set(c,new LootTableEngine(new Random(world.getDynamicProperty("blue_"+c.id) as number)))
            }

            c.equipment_loot.forEach(e=>{
                for(let i = 0;i<e[1];i++){
                    this.blueTeamLoot.get(c)?.give(p,'loot_tables/'+e[0]+'.json');
                }
            })
            world.setDynamicProperty("blue_"+c.id,this.blueTeamLoot.get(c)?.randGenerate.seed);

        }else{

        }
    }
}