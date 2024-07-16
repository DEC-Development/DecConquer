import { world } from "@minecraft/server";
import { SpawnPoint } from "../elements/SpawnPoint";
import { MathUtil } from "./MathUtil";
import { game_end, mult_run_command } from "../func";
import { Team } from "./Team";
export class ConquerGame {
    constructor() { }
    static start(max_score) {
        var _a, _b, _c, _d;
        if (typeof (max_score) !== 'number' && typeof (max_score) !== 'string') {
            return false;
        }
        else {
            try {
                max_score = Number(max_score);
            }
            catch (error) {
                return false;
            }
            if (max_score <= 0) {
                return false;
            }
            SpawnPoint.clearAllSpawnedEntities();
            (_a = world.scoreboard.getObjective('team_score')) === null || _a === void 0 ? void 0 : _a.setScore('§b§lBlueTeam', max_score);
            (_b = world.scoreboard.getObjective('team_score')) === null || _b === void 0 ? void 0 : _b.setScore('§c§lRedTeam', max_score);
            world.getDimension('overworld').runCommandAsync('function game/start');
            if (world.getDynamicProperty('spawn_points') != undefined) {
                let spawn_points = JSON.parse(world.getDynamicProperty('spawn_points'));
                Object.keys(spawn_points).forEach(k => {
                    SpawnPoint.spawnEntity(spawn_points[k]);
                });
            }
            let con_id = MathUtil.randomInteger(-10000, 10000);
            world.getAllPlayers().forEach(p => {
                var _a, _b, _c, _d, _e;
                p.setDynamicProperty('conquer_id', con_id);
                (_a = world.scoreboard.getObjective('die_board')) === null || _a === void 0 ? void 0 : _a.setScore(p.scoreboardIdentity, 0);
                (_b = world.scoreboard.getObjective('kill_board')) === null || _b === void 0 ? void 0 : _b.setScore(p.scoreboardIdentity, 0);
                (_c = world.scoreboard.getObjective('damage_board')) === null || _c === void 0 ? void 0 : _c.setScore(p.scoreboardIdentity, 0);
                (_d = world.scoreboard.getObjective('occupy_board')) === null || _d === void 0 ? void 0 : _d.setScore(p.scoreboardIdentity, 0);
                (_e = world.scoreboard.getObjective('hide_minus_board')) === null || _e === void 0 ? void 0 : _e.setScore(p.scoreboardIdentity, 0);
            });
            (_c = world.scoreboard.getObjective('global')) === null || _c === void 0 ? void 0 : _c.setScore('game_state', 1);
            (_d = world.scoreboard.getObjective('global')) === null || _d === void 0 ? void 0 : _d.setScore('score_judge_ticks', 100);
            world.setDynamicProperty('conquer_id', con_id);
            return true;
        }
    }
    static stop() {
        Team.scoreList();
        mult_run_command(world.getDimension('overworld'), [
            'tellraw @a { "rawtext" : [ { "translate" : "text.dec:conquer_stop.name" } ] }',
            'function game/team_reset_all'
        ]);
        game_end();
    }
}
//# sourceMappingURL=ConquerGame.js.map