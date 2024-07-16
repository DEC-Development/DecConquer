import { crystal_manage_book, player_property_check } from "./items/crystal_manage_book";
import { crystal_perspective_book } from "./items/crystal_perspective_book";
import { crystal_teleport_book } from "./items/crystal_teleport_book";
import { world, system, GameMode } from '@minecraft/server';
import { get_score, get_score_arr, if_in, mult_run_command, reset_gamer } from "./func";
import { Team } from "./other_classes/Team";
import { ConquerCrystal } from "./elements/ConquerCrystal";
import { ConquerSettings } from "./other_classes/ConquerSettings";
import { SpawnPoint } from "./elements/SpawnPoint";
import { ConquerGame } from "./other_classes/ConquerGame";
try {
    world.scoreboard.addObjective('team_score', '§lTeamScore');
    world.scoreboard.addObjective('die_board', 'die_board');
    world.scoreboard.addObjective('kill_board', 'kill_board');
    world.scoreboard.addObjective('occupy_board', 'occupy_board');
    world.scoreboard.addObjective('damage_board', 'damage_board');
    world.scoreboard.addObjective('hide_minus_board', 'hide_minus_board');
}
catch (_a) {
}
mult_run_command(world.getDimension('overworld'), [
    'scoreboard players add §b§lBlueTeam team_score 0',
    'scoreboard players add §c§lRedTeam team_score 0',
    'scoreboard objectives setdisplay sidebar team_score',
    'scoreboard players add score_judge_ticks global 0'
]);
world.afterEvents.itemUse.subscribe(e => {
    let location_cor = { x: Math.floor(e.source.location.x), y: Math.floor(e.source.location.y) - 1, z: Math.floor(e.source.location.z) };
    if (e.itemStack.typeId == 'dec:crystal_manage_book') {
        crystal_manage_book.crystal_manage_book_index(e.source, location_cor); //e.block.location
    }
    else if (e.itemStack.typeId == 'dec:crystal_perspective_book') {
        if (e.source.isSneaking) {
            crystal_perspective_book.crystal_perspective_book_index(e.source);
        }
        else {
            Team.scoreStatistics(e.source);
        }
    }
    else if (e.itemStack.typeId == 'dec:crystal_teleport_book') {
        crystal_teleport_book.crystal_teleport_book_index(e.source);
    }
});
world.beforeEvents.entityRemove.subscribe(e => {
    if (e.removedEntity.typeId != 'minecraft:player') {
        e.removedEntity.getTags().forEach(t => {
            if (t.slice(0, 11) == 'spawnpoint_') {
                let spawn_point_name = t.slice(11);
                let spawn_points = JSON.parse(world.getDynamicProperty('spawn_points'));
                if (Object.keys(spawn_points).indexOf(spawn_point_name) != -1) {
                    SpawnPoint.spawnEntity(spawn_points[spawn_point_name]);
                }
            }
        });
    }
});
world.afterEvents.entityDie.subscribe(e => {
    var _a, _b, _c, _d, _e;
    if (e.deadEntity.typeId == 'minecraft:player') {
        let die_deduct = ConquerSettings.getSettings()['die_deduct'];
        (_a = world.scoreboard.getObjective('global')) === null || _a === void 0 ? void 0 : _a.setScore('die_deduct', die_deduct);
        if (if_in('gamer', e.deadEntity.getTags())) {
            e.deadEntity.runCommandAsync('scoreboard players add @s die_board 1');
            let de = e.damageSource.damagingEntity;
            if (de != undefined && de.typeId == 'minecraft:player' && if_in('gamer', de === null || de === void 0 ? void 0 : de.getTags())) {
                let hide_minus_board = world.scoreboard.getObjective('hide_minus_board');
                mult_run_command(de, [
                    'scoreboard players add @s kill_board 1',
                    'scoreboard players add @s hide_minus_board ' + Math.max(0, ((_c = hide_minus_board === null || hide_minus_board === void 0 ? void 0 : hide_minus_board.getScore((_b = e.deadEntity.scoreboardIdentity) !== null && _b !== void 0 ? _b : '')) !== null && _c !== void 0 ? _c : 0) - ((_e = hide_minus_board === null || hide_minus_board === void 0 ? void 0 : hide_minus_board.getScore((_d = de.scoreboardIdentity) !== null && _d !== void 0 ? _d : '')) !== null && _e !== void 0 ? _e : 0))
                ]);
            }
            if (if_in('team_blue', e.deadEntity.getTags())) {
                mult_run_command(e.deadEntity, [
                    'scoreboard players remove §b§lBlueTeam team_score ' + String(die_deduct),
                    'clear @s',
                    'tag @s remove gamer'
                ]);
            }
            else if (if_in('team_red', e.deadEntity.getTags())) {
                mult_run_command(e.deadEntity, [
                    'scoreboard players remove §c§lRedTeam team_score ' + String(die_deduct),
                    'clear @s',
                    'tag @s remove gamer'
                ]);
            }
        }
    }
});
system.afterEvents.scriptEventReceive.subscribe(e => {
    if (e.id == 'dec:conquer_crystal') {
        if (e.message == 'occupy_statistic') {
            ConquerCrystal.occupyStatistic(e.sourceEntity);
        }
    }
    else if (e.id == 'dec:conquer_start') {
        if (ConquerGame.start(e.message)) {
            if (ConquerSettings.getSettings()['auto_detachment']) {
                Team.autoTeamChoose();
            }
        }
        else {
            mult_run_command(e.sourceEntity, [
                'tellraw @s { "rawtext" : [ { "translate" : "text.dec:conquer_start_fail.name" } ] }'
            ]);
        }
    }
    else if (e.id == 'dec:conquer_stop') {
        ConquerGame.stop();
    }
    else if (e.id === 'dec:test') {
        Team.scorePrint();
    }
});
const tick = () => {
    //游戏在开始状态
    if (get_score('global', 'game_state') === 1) {
        //红队失败
        if (get_score('team_score', '§c§lRedTeam') <= 0) {
            Team.redFail();
        }
        //蓝队失败
        if (get_score('team_score', '§b§lBlueTeam') <= 0) {
            Team.blueFail();
        }
        //Score removal
        Team.scoreRemove();
    }
};
system.runInterval(tick, 1);
function check() {
    if (get_score('global', 'game_state') === 1) {
        let spawn_points = SpawnPoint.getAll();
        Object.keys(spawn_points).forEach(k => {
            SpawnPoint.spawnEntity(spawn_points[k]);
        });
    }
    player_property_check();
}
system.runInterval(check, 400);
world.afterEvents.playerJoin.subscribe(e => {
    const playerJoin = {
        name: e.playerName
    };
    let p = world.getPlayers(playerJoin)[0];
    if (p.getDynamicProperty('conquer_score') === undefined) {
        let sc = get_score_arr()[1]; //设置新进入玩家隐藏分数为中位数
        p.setDynamicProperty('conquer_score', sc);
    }
    else if (p.getDynamicProperty('conquer_id') !== world.getDynamicProperty('conquer_id')) {
        p.setDynamicProperty('conquer_id', world.getDynamicProperty('conquer_id'));
        if (world.getPlayers({ gameMode: GameMode.adventure }).indexOf(p) !== -1) {
            reset_gamer(p);
            if (get_score('global', 'game_state') === 1) {
                Team.autoTeamChooseHalfway(p);
            }
        }
    }
});
world.afterEvents.entityHurt.subscribe(e => {
    var _a, _b;
    if (get_score('global', 'game_state') === 1 && ((_a = e.damageSource.damagingEntity) === null || _a === void 0 ? void 0 : _a.typeId) === 'minecraft:player' && e.hurtEntity.typeId === 'minecraft:player') {
        (_b = world.scoreboard.getObjective('damage_board')) === null || _b === void 0 ? void 0 : _b.addScore(e.damageSource.damagingEntity.scoreboardIdentity, e.damage);
    }
});
//# sourceMappingURL=index.js.map