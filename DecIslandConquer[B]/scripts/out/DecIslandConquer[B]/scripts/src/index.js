import { crystal_manage_book } from "./items/crystal_manage_book";
import { crystal_perspective_book } from "./items/crystal_perspective_book";
import { crystal_teleport_book } from "./items/crystal_teleport_book";
import { world, system } from "@minecraft/server";
import Vector3 from '../../../DecIslandB/scripts/ExcellentMInecraftscripts/src/modules/exmc/math/Vector3';
function find_max(target_arr) {
    let max = 0;
    for (let n of target_arr) {
        if (n > max) {
            max = n;
        }
    }
    return max;
}
class player_score {
    constructor(player) {
        this.name = player.nameTag;
        this.team = '';
        if (if_in('team_red', player.getTags())) {
            this.team = '§c§l';
        }
        else if (if_in('team_blue', player.getTags())) {
            this.team = '§b§l';
        }
        this.kill = get_score('kill_board', player.nameTag);
        if (isNaN(this.kill)) {
            this.kill = 0;
        }
        this.die = get_score('die_board', player.nameTag);
        if (isNaN(this.die)) {
            this.die = 0;
        }
        this.occupy = get_score('occupy_board', player.nameTag);
        if (isNaN(this.occupy)) {
            this.occupy = 0;
        }
        this.total_score = 5 * this.kill + this.occupy - 2 * this.die;
    }
}
function kill_die_occupy_list() {
    let txt = '';
    let player_score_list = new Array;
    let player_kill_list = new Array;
    let player_die_list = new Array;
    let player_occupy_list = new Array;
    let player_total_score_list = new Array;
    world.getAllPlayers().forEach(p => {
        if (if_in('team_blue', p.getTags()) || if_in('team_red', p.getTags())) {
            let p_s = new player_score(p);
            player_score_list.push(p_s);
            player_kill_list.push(p_s.kill);
            player_die_list.push(p_s.die);
            player_occupy_list.push(p_s.occupy);
            player_total_score_list.push(p_s.total_score);
        }
    });
    let kill_max = find_max(player_kill_list);
    let die_max = find_max(player_die_list);
    let occupy_max = find_max(player_occupy_list);
    let total_score_max = find_max(player_total_score_list);
    let kill_max_txt = '';
    let die_max_txt = '';
    let occupy_max_txt = '';
    let total_score_max_txt = '';
    for (let p_s of player_score_list) {
        txt = txt + '\n' + p_s.team + p_s.name + '§r: ' + String(p_s.kill) + '|' + String(p_s.die) + '|' + String(p_s.occupy);
        if (p_s.kill == kill_max) {
            kill_max_txt = kill_max_txt + ',' + p_s.team + p_s.name + '§r';
        }
        if (p_s.die == die_max) {
            die_max_txt = die_max_txt + ',' + p_s.team + p_s.name + '§r';
        }
        if (p_s.occupy == occupy_max) {
            occupy_max_txt = occupy_max_txt + ',' + p_s.team + p_s.name + '§r';
        }
        if (p_s.total_score == total_score_max) {
            total_score_max_txt = total_score_max_txt + ',' + p_s.team + p_s.name + '§r';
        }
    }
    kill_max_txt = kill_max_txt.slice(1);
    die_max_txt = die_max_txt.slice(1);
    occupy_max_txt = occupy_max_txt.slice(1);
    total_score_max_txt = total_score_max_txt.slice(1);
    mult_run_command(world.getDimension('overworld'), [
        'tellraw @a { "rawtext" : [ { "translate" : "text.dec:end_score_list.name" } ] }',
        'tellraw @a { "rawtext" : [ { "text": "' + txt + '" } ] }',
        'tellraw @a { "rawtext" : [ { "translate" : "text.dec:end_score_kill_max.name" } ] }',
        'tellraw @a { "rawtext" : [ { "text": "' + kill_max_txt + '" } ] }',
        'tellraw @a { "rawtext" : [ { "translate" : "text.dec:end_score_die_max.name" } ] }',
        'tellraw @a { "rawtext" : [ { "text": "' + die_max_txt + '" } ] }',
        'tellraw @a { "rawtext" : [ { "translate" : "text.dec:end_score_occupy_max.name" } ] }',
        'tellraw @a { "rawtext" : [ { "text": "' + occupy_max_txt + '" } ] }',
        'tellraw @a { "rawtext" : [ { "translate" : "text.dec:end_score_total_score_max.name" } ] }',
        'tellraw @a { "rawtext" : [ { "text": "' + total_score_max_txt + '" } ] }'
    ]);
}
function get_score(sb_id, name) {
    let p = NaN;
    let sbs_raw = world.scoreboard.getObjectives();
    let sbs = new Array;
    sbs_raw.forEach(sb => {
        sbs.push(sb.id);
    });
    if (if_in(sb_id, sbs)) {
        world.scoreboard.getObjective(sb_id).getScores().forEach(f => {
            if (f.participant.displayName == name) {
                p = f.score;
            }
        });
    }
    return p;
}
function if_in(ele, lis) {
    let test = false;
    for (let l of lis) {
        if (l == ele) {
            test = true;
            break;
        }
    }
    return test;
}
function mult_run_command(exe, commands, times = 1) {
    while (times >= 1) {
        for (let c of commands) {
            exe.runCommandAsync(c).catch(e => console.warn(e)).catch(r => {
                exe.runCommandAsync("say " + String(r));
            });
        }
        times = times - 1;
    }
}
try {
    world.scoreboard.addObjective('team_score', '§lTeamScore');
    world.scoreboard.addObjective('die_board', 'die_board');
    world.scoreboard.addObjective('kill_board', 'kill_board');
    world.scoreboard.addObjective('occupy_board', 'occupy_board');
}
catch (_a) {
}
mult_run_command(world.getDimension('overworld'), [
    'scoreboard players add §b§lBlueTeam team_score 0',
    'scoreboard players add §c§lRedTeam team_score 0',
    'scoreboard objectives setdisplay sidebar team_score'
]);
let die_deduct = 5;
let random_equipment = 0;
world.getDimension('overworld').runCommandAsync('say reload complete');
world.afterEvents.itemUse.subscribe(e => {
    e.source.runCommandAsync('say item using');
    let location_cor = new Vector3(Math.floor(e.source.location.x), Math.floor(e.source.location.y), Math.floor(e.source.location.z));
    if (e.itemStack.typeId == 'dec:crystal_manage_book') {
        crystal_manage_book.crystal_manage_book_index(e.source, location_cor); //e.block.location
    }
    else if (e.itemStack.typeId == 'dec:crystal_perspective_book') {
        if (e.source.isSneaking) {
            crystal_perspective_book.crystal_perspective_book_index(e.source);
        }
        else {
            crystal_perspective_book.crystal_perspective_book_tell(e.source);
        }
    }
    else if (e.itemStack.typeId == 'dec:crystal_teleport_book') {
        crystal_teleport_book.crystal_teleport_book_index(e.source);
    }
});
world.afterEvents.entityDie.subscribe(e => {
    die_deduct = get_score('global', 'die_deduct');
    if (isNaN(die_deduct)) {
        die_deduct = 5;
    }
    world.getDimension('overworld').runCommandAsync('scoreboard players set die_deduct global ' + String(die_deduct));
    if (if_in('gamer', e.deadEntity.getTags())) {
        e.deadEntity.runCommandAsync('scoreboard players add @s die_board 1');
        if (e.damageSource.damagingEntity != undefined) {
            e.damageSource.damagingEntity.runCommandAsync('scoreboard players add @s kill_board 1');
        }
        if (if_in('team_blue', e.deadEntity.getTags())) {
            mult_run_command(e.deadEntity, [
                'scoreboard players remove §b§lBlueTeam team_score ' + String(die_deduct),
                'tag @s remove gamer'
            ]);
        }
        else if (if_in('team_red', e.deadEntity.getTags())) {
            mult_run_command(e.deadEntity, [
                'scoreboard players remove §c§lRedTeam team_score ' + String(die_deduct),
                'tag @s remove gamer'
            ]);
        }
    }
});
const tick = () => {
    //游戏在开始状态
    if (get_score('global', 'game_state') === 1) {
        //红队失败
        if (get_score('team_score', '§c§lRedTeam') < 0) {
            kill_die_occupy_list();
            mult_run_command(world.getDimension('overworld'), [
                'tellraw @a { "rawtext" : [ { "translate" : "text.dec:game_red_fail.name","with": { "rawtext": [ { "selector": "@a[tag=team_blue]" } ] } } ] }',
                'function game/team_reset_all'
            ]);
        }
        //蓝队失败
        if (get_score('team_score', '§b§lBlueTeam') < 0) {
            kill_die_occupy_list();
            mult_run_command(world.getDimension('overworld'), [
                'tellraw @a { "rawtext" : [ { "translate" : "text.dec:game_blue_fail.name","with": { "rawtext": [ { "selector": "@a[tag=team_red]" } ] } } ] }',
                'function game/team_reset_all'
            ]);
        }
    }
};
system.runInterval(tick, 1);
//# sourceMappingURL=index.js.map