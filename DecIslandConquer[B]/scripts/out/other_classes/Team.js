import { world, GameMode } from "@minecraft/server";
import { if_in, mult_run_command, in_range, get_score, game_end } from "../func";
import { PlayerScore } from "./PlayerScore";
import { MathUtil } from "./MathUtil";
export class Team {
    constructor() { }
    static getBluePlayers() {
        return world.getPlayers(this.bluePlayerOption);
    }
    static getRedPlayers() {
        return world.getPlayers(this.redPlayerOption);
    }
    static joinBlue(p) {
        p.removeTag('team_red');
        p.addTag('team_blue');
        mult_run_command(p, [
            'tellraw @a { "rawtext" : [ { "translate" : "text.dec:join_blue_team.name","with": { "rawtext": [ { "selector": "@s" } ] } } ] }',
            'titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:join_blue_team_title.name" } ] }'
        ]);
    }
    static joinRed(p) {
        p.removeTag('team_blue');
        p.addTag('team_red');
        mult_run_command(p, [
            'tellraw @a { "rawtext" : [ { "translate" : "text.dec:join_red_team.name","with": { "rawtext": [ { "selector": "@s" } ] } } ] }',
            'titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:join_red_team_title.name" } ] }'
        ]);
    }
    static playerStatistics(p) {
        let player_with_team_arr = new Array;
        let red_t = 0;
        let blue_t = 0;
        let no_t = 0;
        world.getAllPlayers().forEach(p => {
            if (if_in('team_red', p.getTags())) {
                player_with_team_arr.push('§c' + p.nameTag + '§r');
                red_t++;
            }
            else if (if_in('team_blue', p.getTags())) {
                player_with_team_arr.push('§b' + p.nameTag + '§r');
                blue_t++;
            }
            else {
                player_with_team_arr.push('§r' + p.nameTag + '§r');
                no_t++;
            }
        });
        let team_msg = '';
        player_with_team_arr.forEach(p => {
            team_msg += p + ' ';
        });
        mult_run_command(p, [
            'tellraw @s { "rawtext" : [ { "translate" : "text.dec:crystal_perspective_book_team_list.name" } ] }',
            'tellraw @s { "rawtext" : [ { "text": "§r' + team_msg.slice(0, -1) + '§r----§l§c' + String(red_t) + '§r:§l§b' + String(blue_t) + '§r:§l' + String(no_t) + '" } ] }'
        ]);
    }
    static scoreStatistics(p) {
        let c_msg = '';
        let blue_oc = 0;
        let red_oc = 0;
        let no_oc = 0;
        for (let c of world.getDimension('overworld').getEntities({
            type: 'dec:conquer_crystal'
        })) {
            let c_color = '§f§l';
            if (in_range(get_score('global', c.id), -101, -70)) {
                c_color = '§c§l';
                red_oc++;
            }
            else if (in_range(get_score('global', c.id), 70, 101)) {
                c_color = '§b§l';
                blue_oc++;
            }
            else {
                no_oc++;
            }
            c_msg = c_msg + '§r\n' + c_color + c.nameTag;
        }
        c_msg = c_msg.slice(3);
        c_msg = c_msg + '\n----';
        let s_msg = '';
        if (if_in('team_blue', p.getTags())) {
            s_msg = '§b§lBlueTeam(you) ' + String(get_score('team_score', '§b§lBlueTeam')) + ' §c§lRedTeam(enemy) ' + String(get_score('team_score', '§c§lRedTeam'));
            c_msg = c_msg + '§b§l' + String(blue_oc) + '§r:§c§l' + String(red_oc) + '§r:§l' + String(no_oc);
        }
        else if (if_in('team_red', p.getTags())) {
            s_msg = '§c§lRedTeam(you) ' + String(get_score('team_score', '§c§lRedTeam')) + ' §b§lBlueTeam(enemy) ' + String(get_score('team_score', '§b§lBlueTeam'));
            c_msg = c_msg + '§c§l' + String(red_oc) + '§r:§b§l' + String(blue_oc) + '§r:§l' + String(no_oc);
        }
        else {
            s_msg = '§c§lRedTeam ' + String(get_score('team_score', '§c§lRedTeam')) + ' §b§lBlueTeam ' + String(get_score('team_score', '§b§lBlueTeam'));
            c_msg = c_msg + '§c§l' + String(red_oc) + '§r:§b§l' + String(blue_oc) + '§r:§l' + String(no_oc);
        }
        p.runCommandAsync('tellraw @s { "rawtext" : [ { "text": "§r\n' + c_msg + '\n' + s_msg + '" } ] }');
    }
    static scoreRemove() {
        var _a, _b, _c, _d;
        let red_crys = world.getDimension('overworld').getEntities(Team.redCrysOptions);
        let blue_crys = world.getDimension('overworld').getEntities(Team.blueCrysOptions);
        let blue_n = blue_crys.length;
        let red_n = red_crys.length;
        let all_crys_n = world.getDimension('overworld').getEntities(Team.allCrysOptions).length;
        let judge_ticks = (_a = world.scoreboard.getObjective('global')) === null || _a === void 0 ? void 0 : _a.getScore('score_judge_ticks');
        if (judge_ticks <= 0 && blue_n + red_n > 0) {
            //Reset judge ticks
            judge_ticks = Math.abs(blue_n / (blue_n + red_n) - 0.5) * 80 + 20; //can be set later
            if (all_crys_n == blue_n || all_crys_n == red_n) {
                judge_ticks = 10;
            }
            //Score removal
            if (blue_n > red_n) {
                (_b = world.scoreboard.getObjective('team_score')) === null || _b === void 0 ? void 0 : _b.addScore('§c§lRedTeam', -1);
            }
            else if (blue_n < red_n) {
                (_c = world.scoreboard.getObjective('team_score')) === null || _c === void 0 ? void 0 : _c.addScore('§b§lBlueTeam', -1);
            }
        }
        else if (blue_n + red_n > 0) {
            judge_ticks -= 1;
        }
        (_d = world.scoreboard.getObjective('global')) === null || _d === void 0 ? void 0 : _d.setScore('score_judge_ticks', judge_ticks);
    }
    static blueFail() {
        Team.scoreList(true);
        mult_run_command(world.getDimension('overworld'), [
            'tellraw @a { "rawtext" : [ { "translate" : "text.dec:game_blue_fail.name","with": { "rawtext": [ { "selector": "@a[tag=team_red]" } ] } } ] }',
            'function game/team_reset_all'
        ]);
        game_end();
    }
    static redFail() {
        Team.scoreList(true);
        mult_run_command(world.getDimension('overworld'), [
            'tellraw @a { "rawtext" : [ { "translate" : "text.dec:game_red_fail.name","with": { "rawtext": [ { "selector": "@a[tag=team_blue]" } ] } } ] }',
            'function game/team_reset_all'
        ]);
        game_end();
    }
    static autoTeamChooseHalfway(p) {
        let red_l = this.getRedPlayers().length;
        let blue_l = this.getBluePlayers().length;
        if (red_l > blue_l) {
            Team.joinBlue(p);
        }
        else if (red_l < blue_l) {
            Team.joinRed(p);
        }
        else {
            let red_score = get_score('team_score', '§c§lRedTeam');
            let blue_score = get_score('team_score', '§b§lBlueTeam');
            if (red_score > blue_score) {
                Team.joinBlue(p);
            }
            else if (red_score < blue_score) {
                Team.joinRed(p);
            }
            else {
                if (Math.random() > 0) {
                    Team.joinBlue(p);
                }
                else {
                    Team.joinRed(p);
                }
            }
        }
    }
    static autoTeamChoose() {
        let players = world.getPlayers({ gameMode: GameMode.adventure });
        players.sort((a, b) => { var _a, _b; return ((_a = a.getDynamicProperty('conquer_score')) !== null && _a !== void 0 ? _a : 0) - ((_b = b.getDynamicProperty('conquer_score')) !== null && _b !== void 0 ? _b : 0); }); //From the smallest to the largest
        let i = MathUtil.randomInteger(0, 1);
        players.forEach(p => {
            switch (i) {
                case 0:
                    //Join red
                    Team.joinRed(p);
                    i = 1;
                    break;
                default:
                    //Join blue
                    Team.joinBlue(p);
                    i = 0;
                    break;
            }
        });
    }
    static scoreList(set_to_player = false) {
        let txt = '';
        let player_score_list = new Array;
        let player_kill_list = new Array;
        let player_die_list = new Array;
        let player_occupy_list = new Array;
        let player_total_score_list = new Array;
        world.getAllPlayers().forEach(p => {
            if (if_in('team_blue', p.getTags()) || if_in('team_red', p.getTags())) {
                let p_s = new PlayerScore(p);
                player_score_list.push(p_s);
                player_kill_list.push(p_s.kill);
                player_die_list.push(p_s.die);
                player_occupy_list.push(p_s.occupy);
                player_total_score_list.push(p_s.total_score);
                if (set_to_player) {
                    p_s.setScoreToPlayer();
                }
            }
        });
        let kill_max = MathUtil.max(player_kill_list);
        let die_max = MathUtil.max(player_die_list);
        let occupy_max = MathUtil.max(player_occupy_list);
        let total_score_max = MathUtil.max(player_total_score_list);
        let kill_max_txt = '';
        let die_max_txt = '';
        let occupy_max_txt = '';
        let total_score_max_txt = '';
        for (let p_s of player_score_list) {
            txt = txt + p_s.team + p_s.name + '§r: ' + String(p_s.kill) + '|' + String(p_s.die) + '|' + String(p_s.occupy) + '\n';
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
    static scorePrint() {
        world.getAllPlayers().forEach(p => {
            p.runCommandAsync('say ' + String(p.getDynamicProperty('conquer_score')));
        });
    }
}
Team.redPlayerOption = {
    tags: ['team_red']
};
Team.bluePlayerOption = {
    tags: ['team_blue']
};
Team.redCrysOptions = {
    tags: ['team_red'],
    type: 'dec:conquer_crystal'
};
Team.blueCrysOptions = {
    tags: ['team_blue'],
    type: 'dec:conquer_crystal'
};
Team.allCrysOptions = {
    type: 'dec:conquer_crystal'
};
//# sourceMappingURL=Team.js.map