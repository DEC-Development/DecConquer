import { world, Player, Entity, Dimension, Vector3, ScoreboardObjective } from "@minecraft/server";
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { arr_to_v3, reset_gamer, get_score, get_score_arr } from '../func';
import { ConquerSettings } from "../other_classes/ConquerSettings";
import { SpawnPoint } from "../elements/SpawnPoint";
import { Team } from "../other_classes/Team";



function mult_run_command(exe: Player | Entity | Dimension, commands: Array<string>, times: number = 1) {
    while (times >= 1) {
        for (let c of commands) {
            exe.runCommandAsync(c).catch(e => console.warn(e))
        }
        times = times - 1
    }
}

export function player_property_check() {
    let max_health_af = 10
    let maxmagic_af = 20
    try{
        max_health_af = <number>world.scoreboard.getObjective('global')?.getScore('max_health')
    } catch {
    }
    try{
        maxmagic_af = <number>world.scoreboard.getObjective('global')?.getScore('maxmagic')
    } catch {
    }
    world.getAllPlayers().forEach(p => {
        let has_team = false
        p.getTags().forEach(t => {
            if (t.indexOf('hpl') != -1) {
                p.removeTag(t)
            }
            let tag_name = 'hpl' + String(Math.round((max_health_af - 8) / 2))
            p.addTag(tag_name)
            world.scoreboard.getObjective('maxmagic')?.setScore(p, maxmagic_af)
            if (!has_team && (t === 'team_red' || t === 'team_blue')) {
                has_team = true
            }
        })
        if (p.getDynamicProperty('conquer_score') === undefined) {
            let sc = <number>get_score_arr()[1]
            p.setDynamicProperty('conquer_score', sc)
        }
        if (p.getDynamicProperty('conquer_id') !== world.getDynamicProperty('conquer_id') && get_score('global','game_state') === 1) {
            reset_gamer(p)
            p.setDynamicProperty('conquer_id',world.getDynamicProperty('conquer_id'))
            if (ConquerSettings.getSettings()['auto_detachment']){
                Team.autoTeamChooseHalfway(p)
            }
            has_team = true
        }
        if (ConquerSettings.getSettings()['auto_detachment'] && !has_team && get_score('global','game_state')) {
            Team.autoTeamChooseHalfway(p)
        }
    })
}

export class crystal_manage_book {
    constructor() { }
    static crystal_manage_book_index(player: Player, block_l: Vector3) {
        let index = new ActionFormData()
        index.title('text.dec:crystal_manage_book_title.name')
        index.body('text.dec:crystal_manage_book_index_body.name')
        index.button('text.dec:crystal_manage_book_index_create.name')
        index.button('text.dec:crystal_manage_book_index_manage.name')
        index.button('text.dec:crystal_manage_book_index_set.name')
        index.show(player).then(t => {
            if (t.selection == 0) {
                this.crystal_manage_book_create(player, block_l)
            } else if (t.selection == 1) {
                this.crystal_manage_book_manage(player)
            } else if (t.selection == 2) {
                this.crystal_manage_book_set(player)
            }
        })
    }

    static crystal_manage_book_create(player: Player, block_l: Vector3) {
        let index = new ModalFormData()
        index.title('text.dec:crystal_manage_book_title.name')
        index.dropdown('text.dec:crystal_manage_book_create_body.name', [
            'text.dec:crystal_manage_book_create_crystal.name',
            'text.dec:crystal_manage_book_create_tp_point.name',
            'text.dec:crystal_manage_book_create_spawn_point.name'
        ], 0)
        index.textField('text.dec:crystal_manage_book_create_entername.name', '', '')
        index.textField('text.dec:crystal_manage_book_create_spawn_point_entity.name', '', '')
        index.textField('text.dec:crystal_manage_book_create_spawn_point_wait_tick.name', '', '200')
        index.show(player).then(t => {
            if (t.formValues![0] == 0) {
                world.getDimension('overworld').runCommandAsync('summon dec:conquer_crystal ' + String(block_l.x) + ' ' + String(block_l.y + 1) + ' ' + String(block_l.z) + ' 0 0 minecraft:entity_spawned ' + String(t.formValues![1]))
            } else if (t.formValues![0] == 1) {
                let x = block_l.x
                let y = block_l.y + 1
                let z = block_l.z
                mult_run_command(world.getDimension('overworld'), [
                    'scoreboard players set tpp_' + String(t.formValues![1]) + '_x global ' + String(x),
                    'scoreboard players set tpp_' + String(t.formValues![1]) + '_y global ' + String(y),
                    'scoreboard players set tpp_' + String(t.formValues![1]) + '_z global ' + String(z),
                ])
            } else if (t.formValues![0] == 2) {
                let loc = block_l
                loc.y += 1
                if (!SpawnPoint.set(String(t.formValues![1]),loc,player.dimension,<string>t.formValues![2],Number(t.formValues![3]))){
                    player.runCommandAsync('titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:crystal_manage_book_create_spawn_point_fail.name" } ] }')
                    t.canceled
                }
            }
        })
    }

    static crystal_manage_book_manage(player: Player) {
        let index = new ModalFormData()
        index.title('text.dec:crystal_manage_book_title.name')
        let manage_body = new Array<string>
        for (let c of world.getDimension('overworld').getEntities(
            {
                type: 'dec:conquer_crystal'
            }
        )) {
            manage_body.push('Crystal ' + c.nameTag)
        }
        let tpp_coor: { [name: string]: { [c: string]: number } } = {};
        (<ScoreboardObjective>world.scoreboard.getObjective('global')).getScores().forEach(o => {
            if (o.participant.displayName.slice(0, 4) == 'tpp_') {
                let name = o.participant.displayName.slice(4, -2)
                let c = o.participant.displayName.slice(-1)
                let num = o.score
                if (name in tpp_coor == false) {
                    tpp_coor[name] = {}
                    manage_body.push('Tppoint ' + name)
                }
                tpp_coor[name][c] = num
            }
        })
        if (world.getDynamicPropertyIds().indexOf('spawn_points') != -1) {
            let spawn_points = JSON.parse(<string>world.getDynamicProperty('spawn_points'))
            for (let k of Object.keys(spawn_points)) {
                manage_body.push('Spawnpoint ' + k)
            }
        }
        index.dropdown('text.dec:crystal_manage_book_manage_body.name', manage_body, 0)
        index.dropdown('text.dec:crystal_manage_book_manage_act.name', [
            'text.dec:crystal_manage_book_manage_tp.name',
            'text.dec:crystal_manage_book_manage_modify.name',//1
            'text.dec:crystal_manage_book_manage_delete.name'//2
        ], 0)
        index.textField('text.dec:crystal_manage_book_rename.name', '', '')
        index.textField('text.dec:crystal_manage_book_rename_spawn_point_entity.name', '', '')
        index.textField('text.dec:crystal_manage_book_rename_spawn_point_wait_ticks.name', '', '')
        index.show(player).then(t => {
            let ob_type = ''
            let choose_ob = manage_body[(<Array<number>>t.formValues)![0]]
            if (choose_ob.slice(0, 10) == 'Spawnpoint') {
                ob_type = 'Spawnpoint'
            } else if (choose_ob.slice(0, 7) == 'Tppoint' || choose_ob.slice(0, 7) == 'Crystal') {
                ob_type = choose_ob.slice(0, 7)
            }
            let ob_name = manage_body[(<Array<number>>t.formValues)![0]].slice(8)
            if (ob_type == 'Crystal') {
                if (Number(t.formValues![1] == 0)) {
                    player.runCommandAsync('tp @s @e[c=1,type=dec:conquer_crystal,name=\"' + ob_name + '\"]')
                } else if (Number(t.formValues![1] == 1)) {
                    mult_run_command(player, [
                        'execute at @e[c=1,type=dec:conquer_crystal,name=\"' + ob_name + '\"] run summon dec:conquer_crystal ~~~ 0 0 minecraft:entity_spawned ' + String(t.formValues![2]),
                        'event entity @e[c=1,type=dec:conquer_crystal,name=\"' + ob_name + '\"] minecraft:despawn'
                    ])
                } else if (Number(t.formValues![1] == 2)) {
                    player.runCommandAsync('event entity @e[c=1,type=dec:conquer_crystal,name=\"' + ob_name + '\"] minecraft:despawn')
                }
            } else if (ob_type == 'Tppoint') {
                let x = tpp_coor[ob_name]['x']
                let y = tpp_coor[ob_name]['y']
                let z = tpp_coor[ob_name]['z']
                if (Number(t.formValues![1] == 0)) {
                    player.runCommandAsync('tp @s ' + String(x) + ' ' + String(y) + " " + String(z))
                } else if (Number(t.formValues![1] == 1)) {
                    mult_run_command(player, [
                        'scoreboard players set tpp_' + String(t.formValues![2]) + '_x global ' + String(x),
                        'scoreboard players set tpp_' + String(t.formValues![2]) + '_y global ' + String(y),
                        'scoreboard players set tpp_' + String(t.formValues![2]) + '_z global ' + String(z),
                        'scoreboard players reset tpp_' + ob_name + '_x global',
                        'scoreboard players reset tpp_' + ob_name + '_y global',
                        'scoreboard players reset tpp_' + ob_name + '_z global'
                    ])
                } else if (Number(t.formValues![1] == 2)) {
                    mult_run_command(player, [
                        'scoreboard players reset tpp_' + ob_name + '_x global',
                        'scoreboard players reset tpp_' + ob_name + '_y global',
                        'scoreboard players reset tpp_' + ob_name + '_z global'
                    ])
                }
            } else if (ob_type == 'Spawnpoint') {
                let spawn_point_name = choose_ob.slice(11)
                let spawn_point = SpawnPoint.getAll()[spawn_point_name]
                if (Number(t.formValues![1] == 0)) {
                    player.teleport(arr_to_v3(spawn_point['location']))
                } else if (Number(t.formValues![1] == 1)) {
                    //Modify
                    let loc = spawn_point['location']
                    let entity = <string|undefined>spawn_point['entity']
                    let wait_ticks = <number|undefined>spawn_point['wait_ticks']
                    entity = <string|undefined>t.formValues![3]
                    wait_ticks = Number(t.formValues![4])
                    let new_name = <string|undefined>t.formValues![2]
                    if(!SpawnPoint.modify(spawn_point_name,new_name,loc,player.dimension,entity,wait_ticks)){
                        player.runCommandAsync('titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:crystal_manage_book_manage_spawn_point_ticks_fail.name" } ] }')
                    }
                } else if (Number(t.formValues![1] == 2)) {
                    SpawnPoint.delete(spawn_point_name)
                }
            }
        })
    }
    static crystal_manage_book_set(player: Player) {
        let index = new ModalFormData()
        index.title('text.dec:crystal_manage_book_title.name')

        let settings = ConquerSettings.getSettings()

        index.slider('Die Deduct', 0, 100, 1, settings['die_deduct'])//text.dec:crystal_manage_book_manage_die_deduct.name
        index.slider('Max Health', 10, 24, 2, settings['max_health'])//
        index.slider('Max Magic', 20, 60, 2, settings['maxmagic'])//
        index.toggle('text.dec:crystal_manage_book_manage_random_equipment.name', settings['random_equipment'])
        index.toggle('text.dec:crystal_manage_book_manage_auto_detachment.name', settings['auto_detachment'])
        index.toggle('text.dec:crystal_manage_book_manage_clear_after_game.name', settings['clear_after_game'])

        index.show(player).then(t => {
            let max_health_af = <number>t.formValues![1]
            let maxmagic_af = <number>t.formValues![2]

            world.scoreboard.getObjective('global')?.setScore('die_deduct', <number>t.formValues![0])
            world.scoreboard.getObjective('global')?.setScore('max_health', max_health_af)
            world.scoreboard.getObjective('global')?.setScore('maxmagic', maxmagic_af)
            world.scoreboard.getObjective('global')?.setScore('random_equipment', <number>t.formValues![3])
            world.scoreboard.getObjective('global')?.setScore('auto_detachment', <number>t.formValues![4])
            world.scoreboard.getObjective('global')?.setScore('clear_after_game', <number>t.formValues![5])

            player_property_check()
        })
    }
}