import { GameMode, world } from "@minecraft/server";
import { if_in, mult_run_command, str_repeat, v3_to_string } from '../func';
export class ConquerCrystal {
    constructor() { }
    static teleport(en, cry_name) {
        en.teleport(ConquerCrystal.searchCrystalByName(cry_name).location);
    }
    static searchCrystalByName(name) {
        let q = {
            name: name
        };
        let crys = world.getDimension('overworld').getEntities(q);
        return crys[0];
    }
    static rename(name, old_name) {
        ConquerCrystal.searchCrystalByName(old_name).nameTag = name;
    }
    static create(name, location) {
        if (world.getDimension('overworld').getEntities())
            ConquerCrystal.delete(name);
        mult_run_command(world.getDimension('overworld'), [
            'summon dec:conquer_crystal ' + name + v3_to_string(location)
        ]);
    }
    static delete(name) {
        world.getDimension('overworld').runCommandAsync('event entity @e[c=1,type=dec:conquer_crystal,name=\"' + name + '\"] minecraft:despawn').then(c => {
            if (c.successCount == 1) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    static occupyStatistic(cc) {
        var _a, _b;
        const occupyStatisticSetOptions = {
            location: cc.location,
            type: 'minecraft:player',
            tags: ['gamer'],
            maxDistance: 8,
            excludeGameModes: [GameMode.creative, GameMode.spectator]
        };
        const nearby_players = cc.dimension.getEntities(occupyStatisticSetOptions);
        let occ_weight = 0;
        let d_score = 0;
        let cur_score = (_a = world.scoreboard.getObjective('global')) === null || _a === void 0 ? void 0 : _a.getScore(cc.scoreboardIdentity);
        if (nearby_players.length > 0) {
            //Have players nearby
            nearby_players.forEach(p => {
                let d_sq = Math.pow(p.location.x - cc.location.x, 2) + Math.pow(p.location.y - cc.location.y, 2) + Math.pow(p.location.z - cc.location.z, 2);
                let d_occ_weight = -0.125 * d_sq + 10;
                if (if_in('team_blue', p.getTags())) {
                    occ_weight += d_occ_weight;
                }
                else {
                    occ_weight -= d_occ_weight;
                }
            });
            if (Math.abs(occ_weight) > 25) {
                d_score = Math.sign(occ_weight) * 25;
            }
            else {
                d_score = occ_weight;
            }
            if (occ_weight > 0 && cur_score != 100) {
                //Blue occupying
                mult_run_command(cc, [
                    //'titleraw @e[type=player,r=8] actionbar { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_becoming_blue.name" } ] }',
                    'scoreboard players add @a[r=8,tag=team_blue] occupy_board 1'
                ]);
                let p_location = cc.location;
                p_location.y += 1.3;
                world.getDimension('overworld').spawnParticle('dec:occupying_team_blue_particle', p_location);
            }
            else if (occ_weight < 0 && cur_score != -100) {
                //Red occupying
                mult_run_command(cc, [
                    //'titleraw @e[type=player,r=8] actionbar { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_becoming_red.name" } ] }',
                    'scoreboard players add @a[r=8,tag=team_red] occupy_board 1'
                ]);
                let p_location = cc.location;
                p_location.y += 1.3;
                world.getDimension('overworld').spawnParticle('dec:occupying_team_red_particle', p_location);
            }
        }
        else {
            if (cur_score <= -70 && cur_score > -100) {
                d_score = -2;
            }
            else if (cur_score >= 70 && cur_score < 100) {
                d_score = 2; //This could be set later
            }
            else if (cur_score > -70 && cur_score < 0) {
                d_score = 2;
            }
            else if (cur_score < 70 && cur_score > 0) {
                d_score = -2;
            }
        }
        let after_score = cur_score + d_score;
        if (after_score > 100) {
            after_score = 100;
        }
        else if (after_score < -100) {
            after_score = -100;
        }
        if (cur_score > -100 && after_score == -100) {
            //Be occupied by red
            mult_run_command(cc, [
                'tellraw @a { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_become_red.name","with": { "rawtext": [ { "selector": "@s" } ] } } ] }',
                'event entity @s minecraft:red'
            ]);
        }
        else if (cur_score < 100 && after_score == 100) {
            //Be occupied by blue
            mult_run_command(cc, [
                'tellraw @a { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_become_blue.name","with": { "rawtext": [ { "selector": "@s" } ] } } ] }',
                'event entity @s minecraft:blue'
            ]);
        }
        if (cur_score <= -70 && after_score > -70) {
            //Red losing
            mult_run_command(cc, [
                'tellraw @a[tag=team_red] { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_losing_red.name","with": { "rawtext": [ { "selector": "@s" } ] } } ] }',
                'event entity @s minecraft:light_red'
            ]);
        }
        else if (cur_score >= 70 && after_score < 70) {
            //Blue losing
            mult_run_command(cc, [
                'tellraw @a[tag=team_blue] { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_losing_blue.name","with": { "rawtext": [ { "selector": "@s" } ] } } ] }',
                'event entity @s minecraft:light_blue'
            ]);
        }
        else if (after_score <= -70 && after_score > -100) {
            mult_run_command(cc, [
                'event entity @s minecraft:light_red'
            ]);
        }
        else if (after_score >= 70 && after_score < 100) {
            mult_run_command(cc, [
                'event entity @s minecraft:light_blue'
            ]);
        }
        (_b = world.scoreboard.getObjective('global')) === null || _b === void 0 ? void 0 : _b.setScore(cc.scoreboardIdentity, after_score);
        //Vision effect
        let crys_particle_location = cc.location;
        crys_particle_location.y += 3;
        let ocp_msg = '';
        let colored_n = Math.floor(Math.abs(after_score) / ConquerCrystal.process_len);
        let uncolored_n = ConquerCrystal.process_bar - colored_n;
        let score_msg = String(str_repeat('█', colored_n) + '§r§l' + str_repeat('█', uncolored_n));
        if (after_score == -100) {
            //Red
            world.getDimension('overworld').spawnParticle('dec:crystal_team_red_particle', crys_particle_location);
            ocp_msg = '§c§l' + score_msg;
        }
        else if (after_score <= -70) {
            //Light Red
            world.getDimension('overworld').spawnParticle('dec:crystal_team_light_red_particle', crys_particle_location);
            ocp_msg = '§c§l' + score_msg;
        }
        else if (after_score == 100) {
            //Blue
            world.getDimension('overworld').spawnParticle('dec:crystal_team_blue_particle', crys_particle_location);
            ocp_msg = '§b§l' + score_msg;
        }
        else if (after_score >= 70) {
            //Light blue
            world.getDimension('overworld').spawnParticle('dec:crystal_team_light_blue_particle', crys_particle_location);
            ocp_msg = '§b§l' + score_msg;
        }
        else {
            //White
            cc.triggerEvent('minecraft:white');
            world.getDimension('overworld').spawnParticle('dec:crystal_team_white_particle', crys_particle_location);
            if (after_score > 0) {
                ocp_msg = '§b§l' + score_msg;
            }
            else if (after_score < 0) {
                ocp_msg = '§c§l' + score_msg;
            }
            else {
                ocp_msg = '§r§l' + score_msg;
            }
        }
        cc.runCommandAsync('title @a[r=8] actionbar ' + ocp_msg);
    }
}
ConquerCrystal.process_bar = 20;
ConquerCrystal.process_len = 100 / ConquerCrystal.process_bar;
//# sourceMappingURL=ConquerCrystal.js.map