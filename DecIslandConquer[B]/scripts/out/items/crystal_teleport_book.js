import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
class MathUtil {
    static randomInteger(min, max) {
        let length = Math.floor(Math.random() * (max - min + 1));
        return min + length;
    }
}
function in_range(input, min, max) {
    if (min <= input && input <= max) {
        return true;
    }
    else {
        return false;
    }
}
function mult_run_command(exe, commands, times = 1) {
    while (times >= 1) {
        for (let c of commands) {
            exe.runCommandAsync(c).catch(e => console.warn(e));
        }
        times = times - 1;
    }
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
function get_score(sb_id, name) {
    let p = NaN;
    world.scoreboard.getObjective(sb_id).getScores().forEach(f => {
        if (f.participant.displayName == name) {
            p = f.score;
        }
    });
    return p;
}
function get_random_equipment(t, player) {
    mult_run_command(player, [
        'clear @s',
        'give @s dec:crystal_perspective_book',
        'give @s dec:iron_apple 5'
    ]);
    if (t.formValues[1] == 0) {
        //Choose Warrior
        mult_run_command(player, [
            'loot give @s loot "template/weapon/melee_weapon"',
            'loot give @s loot "template/weapon/melee_weapon"',
            'loot give @s loot "template/weapon/melee_weapon"',
            'give @s shield 1 276'
        ]);
    }
    else if (t.formValues[1] == 1) {
        //Choose Archer
        mult_run_command(player, [
            'loot give @s loot "template/weapon/melee_weapon/dagger"',
            'loot give @s loot "template/weapon/range_weapon"',
            'loot give @s loot "template/weapon/thrown_weapon"',
            'loot give @s loot "template/weapon/thrown_weapon"',
            'loot give @s loot "template/weapon/thrown_weapon"',
            'loot give @s loot "template/weapon/assist_item"'
        ]);
    }
    else if (t.formValues[1] == 2) {
        //Choose Wizard
        mult_run_command(player, [
            'loot give @s loot "template/weapon/melee_weapon/dagger"',
            'loot give @s loot "template/weapon/magic_weapon"',
            'loot give @s loot "template/weapon/magic_weapon"',
            'loot give @s loot "template/weapon/magic_weapon"',
            'loot give @s loot "template/weapon/summon_weapon"',
            'give @s dec:lapis_magic_book'
        ]);
    }
}
export class crystal_teleport_book {
    constructor() { }
    static crystal_teleport_book_index(player) {
        if (get_score('global', 'game_state') == 0) {
            player.runCommandAsync('tellraw @s { "rawtext" : [ { "translate" : "text.dec:crystal_teleport_book_not_start.name" } ] }');
        }
        else if (if_in('team_blue', player.getTags()) == false && if_in('team_red', player.getTags()) == false) {
            //Do not choose a team
            player.runCommandAsync('tellraw @s { "rawtext" : [ { "translate" : "text.dec:crystal_teleport_book_no_team.name" } ] }');
        }
        else {
            let team_tpp_prefix = '';
            let body_team = '';
            if (if_in('team_blue', player.getTags())) {
                team_tpp_prefix = 'b_';
                body_team = 'text.dec:crystal_teleport_book_body_blue_team.name';
            }
            else {
                team_tpp_prefix = 'r_';
                body_team = 'text.dec:crystal_teleport_book_body_red_team.name';
            }
            let index = new ModalFormData();
            index.title('text.dec:crystal_teleport_book_title.name');
            let manage_body = new Array;
            for (let c of world.getDimension('overworld').getEntities({
                type: 'dec:conquer_crystal'
            })) {
                if (if_in('team_blue', player.getTags()) && in_range(get_score('global', c.id), 70, 101)) {
                    manage_body.push('Crystal ' + c.nameTag);
                }
                else if (if_in('team_red', player.getTags()) && in_range(get_score('global', c.id), -101, -70)) {
                    manage_body.push('Crystal ' + c.nameTag);
                }
            }
            let tpp_coor = {};
            world.scoreboard.getObjective('global').getScores().forEach(o => {
                if (o.participant.displayName.slice(0, 6) == 'tpp_' + team_tpp_prefix) {
                    let name = o.participant.displayName.slice(4, -2);
                    let c = o.participant.displayName.slice(-1);
                    let num = o.score;
                    if (name in tpp_coor == false) {
                        tpp_coor[name] = {};
                        manage_body.push('Tppoint ' + name.slice(2));
                    }
                    tpp_coor[name][c] = num;
                }
            });
            index.dropdown(body_team, manage_body, 0);
            let random_equipment = get_score('global', 'random_equipment');
            if (isNaN(random_equipment)) {
                random_equipment = 0;
            }
            if (random_equipment == 1) {
                index.dropdown('text.dec:crystal_teleport_book_profession.name', [
                    'text.dec:crystal_teleport_book_profession_warrior.name',
                    'text.dec:crystal_teleport_book_profession_archer.name',
                    'text.dec:crystal_teleport_book_profession_wizard.name'
                ], MathUtil.randomInteger(0, 2));
            }
            index.show(player).then(t => {
                let ob_type = manage_body[t.formValues[0]].slice(0, 7);
                let ob_name = manage_body[t.formValues[0]].slice(8);
                if (ob_type == 'Crystal') {
                    mult_run_command(player, [
                        'tp @s @e[c=1,type=dec:conquer_crystal,name=\"' + ob_name + '\"]',
                        'tag @s add gamer',
                        'clear @s dec:crystal_teleport_book'
                    ]);
                }
                else if (ob_type == 'Tppoint') {
                    let x = tpp_coor[team_tpp_prefix + ob_name]['x'];
                    let y = tpp_coor[team_tpp_prefix + ob_name]['y'];
                    let z = tpp_coor[team_tpp_prefix + ob_name]['z'];
                    mult_run_command(player, [
                        'tp @s ' + String(x) + ' ' + String(y) + " " + String(z),
                        'tag @s add gamer',
                        'effect @s instant_health 120 255',
                        'clear @s dec:crystal_teleport_book'
                    ]);
                }
                if (random_equipment == 1) {
                    get_random_equipment(t, player);
                }
            });
        }
    }
}
//# sourceMappingURL=crystal_teleport_book.js.map