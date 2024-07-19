import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { reset_gamer, get_score, get_score_arr } from '../func';
import { ConquerSettings } from "../other_classes/ConquerSettings";
import { SpawnPoint } from "../elements/SpawnPoint";
import { Team } from "../other_classes/Team";
import { ConquerCrystal } from '../elements/ConquerCrystal';
import { TeleportPoint } from '../elements/TeleportPoint';
function mult_run_command(exe, commands, times = 1) {
    while (times >= 1) {
        for (let c of commands) {
            exe.runCommandAsync(c).catch(e => console.warn(e));
        }
        times = times - 1;
    }
}
export function player_property_check() {
    var _a, _b;
    let max_health_af = 10;
    let maxmagic_af = 20;
    try {
        max_health_af = (_a = world.scoreboard.getObjective('global')) === null || _a === void 0 ? void 0 : _a.getScore('max_health');
    }
    catch (_c) {
    }
    try {
        maxmagic_af = (_b = world.scoreboard.getObjective('global')) === null || _b === void 0 ? void 0 : _b.getScore('maxmagic');
    }
    catch (_d) {
    }
    world.getAllPlayers().forEach(p => {
        let has_team = false;
        p.getTags().forEach(t => {
            var _a;
            if (t.indexOf('hpl') != -1) {
                p.removeTag(t);
            }
            let tag_name = 'hpl' + String(Math.round((max_health_af - 8) / 2));
            p.addTag(tag_name);
            (_a = world.scoreboard.getObjective('maxmagic')) === null || _a === void 0 ? void 0 : _a.setScore(p, maxmagic_af);
            if (!has_team && (t === 'team_red' || t === 'team_blue')) {
                has_team = true;
            }
        });
        if (p.getDynamicProperty('conquer_score') === undefined) {
            let sc = get_score_arr()[1];
            p.setDynamicProperty('conquer_score', sc);
        }
        if (p.getDynamicProperty('conquer_id') !== world.getDynamicProperty('conquer_id') && get_score('global', 'game_state') === 1) {
            reset_gamer(p);
            p.setDynamicProperty('conquer_id', world.getDynamicProperty('conquer_id'));
            if (ConquerSettings.getSettings()['auto_detachment']) {
                Team.autoTeamChooseHalfway(p);
            }
            has_team = true;
        }
        if (ConquerSettings.getSettings()['auto_detachment'] && !has_team && get_score('global', 'game_state')) {
            Team.autoTeamChooseHalfway(p);
        }
    });
}
export class crystal_manage_book {
    constructor() { }
    static crystal_manage_book_index(player, block_l) {
        let index = new ActionFormData();
        index.title('text.dec:crystal_manage_book_title.name');
        index.body('text.dec:crystal_manage_book_index_body.name');
        index.button('text.dec:crystal_manage_book_index_create.name');
        index.button('text.dec:crystal_manage_book_index_manage.name');
        index.button('text.dec:crystal_manage_book_index_set.name');
        index.show(player).then(t => {
            if (t.selection == 0) {
                this.crystal_manage_book_create(player, block_l);
            }
            else if (t.selection == 1) {
                this.crystal_manage_book_manage(player);
            }
            else if (t.selection == 2) {
                this.crystal_manage_book_set(player);
            }
        });
    }
    static crystal_manage_book_create(player, block_l) {
        let index = new ModalFormData();
        index.title('text.dec:crystal_manage_book_title.name');
        index.dropdown('text.dec:crystal_manage_book_create_body.name', [
            'text.dec:crystal_manage_book_create_crystal.name',
            'text.dec:crystal_manage_book_create_tp_point.name',
            'text.dec:crystal_manage_book_create_spawn_point.name'
        ], 0);
        index.textField('text.dec:crystal_manage_book_create_entername.name', '', '');
        index.show(player).then(t => {
            if (t.formValues[0] == 0) {
                let loc = block_l;
                loc.y += 1;
                ConquerCrystal.create(t.formValues[1], loc);
            }
            else if (t.formValues[0] == 1) {
                let loc = block_l;
                loc.y += 1;
                TeleportPoint.create(String(t.formValues[1]), loc);
            }
            else if (t.formValues[0] == 2) {
                let loc = block_l;
                loc.y += 1;
                let spawn_point_index = new ModalFormData();
                spawn_point_index.title('text.dec:crystal_manage_book_spawn_point_index_title.name');
                spawn_point_index.textField('text.dec:crystal_manage_book_create_spawn_point_entity.name', '', '');
                spawn_point_index.textField('text.dec:crystal_manage_book_create_spawn_point_wait_tick.name', '', '200');
                spawn_point_index.show(player).then(t_1 => {
                    if (!SpawnPoint.set(String(t.formValues[1]), loc, player.dimension, t_1.formValues[0], Number(t_1.formValues[1]))) {
                        player.runCommandAsync('titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:crystal_manage_book_create_spawn_point_fail.name" } ] }');
                        t.canceled;
                    }
                });
            }
        });
    }
    static crystal_manage_book_manage(player) {
        let index = new ModalFormData();
        index.title('text.dec:crystal_manage_book_title.name');
        let manage_body = new Array;
        for (let c of world.getDimension('overworld').getEntities({
            type: 'dec:conquer_crystal'
        })) {
            manage_body.push('Crystal ' + c.nameTag);
        }
        TeleportPoint.getData(manage_body);
        SpawnPoint.getData(manage_body);
        index.dropdown('text.dec:crystal_manage_book_manage_body.name', manage_body, 0);
        index.dropdown('text.dec:crystal_manage_book_manage_act.name', [
            'text.dec:crystal_manage_book_manage_tp.name',
            'text.dec:crystal_manage_book_manage_modify.name',
            'text.dec:crystal_manage_book_manage_delete.name' //2
        ], 0);
        index.textField('text.dec:crystal_manage_book_rename.name', '', '');
        index.show(player).then(t => {
            let ob_type = '';
            let choose_ob = manage_body[t.formValues[0]];
            if (choose_ob.slice(0, 10) == 'Spawnpoint') {
                ob_type = 'Spawnpoint';
            }
            else if (choose_ob.slice(0, 7) == 'Tppoint' || choose_ob.slice(0, 7) == 'Crystal') {
                ob_type = choose_ob.slice(0, 7);
            }
            let ob_name = manage_body[t.formValues[0]].slice(8);
            if (ob_type == 'Crystal') {
                if (Number(t.formValues[1] == 0)) {
                    ConquerCrystal.teleport(player, ob_name);
                }
                else if (Number(t.formValues[1] == 1)) {
                    ConquerCrystal.rename(String(t.formValues[2]), ob_name);
                }
                else if (Number(t.formValues[1] == 2)) {
                    ConquerCrystal.delete(ob_name);
                }
            }
            else if (ob_type == 'Tppoint') {
                if (Number(t.formValues[1] == 0)) {
                    TeleportPoint.teleport(player, ob_name);
                }
                else if (Number(t.formValues[1] == 1)) {
                    TeleportPoint.rename(String(t.formValues[2]), ob_name);
                }
                else if (Number(t.formValues[1] == 2)) {
                    TeleportPoint.delete(ob_name);
                }
            }
            else if (ob_type == 'Spawnpoint') {
                let spawn_point_name = choose_ob.slice(11);
                let spawn_point = SpawnPoint.getData()[spawn_point_name];
                if (Number(t.formValues[1] == 0)) {
                    SpawnPoint.teleport(player, spawn_point_name);
                }
                else if (Number(t.formValues[1] == 1)) {
                    //Modify
                    let loc = spawn_point['location'];
                    let new_name = t.formValues[2];
                    let spawn_point_index = new ModalFormData();
                    spawn_point_index.title('text.dec:crystal_manage_book_spawn_point_index_title.name');
                    spawn_point_index.textField('text.dec:crystal_manage_book_rename_spawn_point_entity.name', '', '');
                    spawn_point_index.textField('text.dec:crystal_manage_book_rename_spawn_point_wait_ticks.name', '', '');
                    spawn_point_index.show(player).then(t_1 => {
                        let entity = spawn_point['entity'];
                        let wait_ticks = spawn_point['wait_ticks'];
                        entity = t_1.formValues[0];
                        wait_ticks = Number(t_1.formValues[1]);
                        if (!SpawnPoint.modify(spawn_point_name, new_name, loc, player.dimension, entity, wait_ticks)) {
                            player.runCommandAsync('titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:crystal_manage_book_manage_spawn_point_ticks_fail.name" } ] }');
                        }
                    });
                }
                else if (Number(t.formValues[1] == 2)) {
                    SpawnPoint.delete(spawn_point_name);
                }
            }
        });
    }
    static crystal_manage_book_set(player) {
        let index = new ModalFormData();
        index.title('text.dec:crystal_manage_book_title.name');
        let settings = ConquerSettings.getSettings();
        index.slider('Die Deduct', 0, 100, 1, settings['die_deduct']); //text.dec:crystal_manage_book_manage_die_deduct.name
        index.slider('Max Health', 10, 24, 2, settings['max_health']); //
        index.slider('Max Magic', 20, 60, 2, settings['maxmagic']); //
        index.toggle('text.dec:crystal_manage_book_manage_random_equipment.name', settings['random_equipment']);
        index.toggle('text.dec:crystal_manage_book_manage_auto_detachment.name', settings['auto_detachment']);
        index.toggle('text.dec:crystal_manage_book_manage_clear_after_game.name', settings['clear_after_game']);
        index.toggle('text.dec:crystal_manage_book_manage_equipment_queue.name', settings['equipment_queue']);
        index.show(player).then(t => {
            var _a, _b, _c, _d, _e, _f, _g;
            let max_health_af = t.formValues[1];
            let maxmagic_af = t.formValues[2];
            (_a = world.scoreboard.getObjective('global')) === null || _a === void 0 ? void 0 : _a.setScore('die_deduct', t.formValues[0]);
            (_b = world.scoreboard.getObjective('global')) === null || _b === void 0 ? void 0 : _b.setScore('max_health', max_health_af);
            (_c = world.scoreboard.getObjective('global')) === null || _c === void 0 ? void 0 : _c.setScore('maxmagic', maxmagic_af);
            (_d = world.scoreboard.getObjective('global')) === null || _d === void 0 ? void 0 : _d.setScore('random_equipment', t.formValues[3]);
            (_e = world.scoreboard.getObjective('global')) === null || _e === void 0 ? void 0 : _e.setScore('auto_detachment', t.formValues[4]);
            (_f = world.scoreboard.getObjective('global')) === null || _f === void 0 ? void 0 : _f.setScore('clear_after_game', t.formValues[5]);
            (_g = world.scoreboard.getObjective('global')) === null || _g === void 0 ? void 0 : _g.setScore('equipment_queue', t.formValues[6]);
            player_property_check();
        });
    }
}
//# sourceMappingURL=CrystalManageBook.js.map