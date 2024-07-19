import { Entity, EntityQueryOptions, Vector3, system, world, Dimension, Player } from '@minecraft/server';
import { get_score, arr_to_v3, v3_to_array } from "../func"

export class SpawnPoint {
    constructor() { }
    static teleport(en:Entity|Player,name:string){
        let spawn_point = SpawnPoint.getData()[name]
        en.teleport(arr_to_v3(spawn_point.location))
    }
    static spawnEntity(spawn_point: Record<string, any>) {
        let name = spawn_point['name']
        if (get_score('global', 'game_state') == 1) {
            let location = arr_to_v3(spawn_point['location'])
            let entity_id = spawn_point['entity']
            let wait_ticks = Number(spawn_point['wait_ticks'])
            const spawnPointEntity: EntityQueryOptions = {
                tags: ['spawnpoint_' + name]
            }
            system.runTimeout(() => {
                if (world.getDimension('overworld').getEntities(spawnPointEntity).length == 0) {
                    let entity = world.getDimension(spawn_point['dimension']).spawnEntity(entity_id, location)
                    entity.addTag('spawnpoint_' + name)
                }
            }, wait_ticks)
        }
    }
    static clearAllSpawnedEntities() {
        let spawn_points = this.getData()
        if (Object.keys(spawn_points).length > 0) {
            Object.keys(spawn_points).forEach(k => {
                const spawnPointEntity: EntityQueryOptions = {
                    tags: ['spawnpoint_' + k]
                }
                world.getDimension('overworld').getEntities(spawnPointEntity).forEach(e => {
                    e.remove()
                })
            })
        }
    }
    static getData(manage_body?:Array<string>) {
        if(world.getDynamicProperty('spawn_points') != undefined){
            let s = <{
                [name: string]:
                {
                    'name': string,
                    'location': Array<number>,
                    'dimension': string,
                    'entity': string,
                    'wait_ticks': number
                }
            }>JSON.parse(<string>world.getDynamicProperty('spawn_points'))
            if (manage_body!=undefined){
                for (let k of Object.keys(s)) {
                    manage_body.push('Spawnpoint ' + k)
                }
            }
            return s
        }
        return {}
    }
    static set(name: string, loc: Vector3 | Array<number>, dim: Dimension | string, entity: Entity | string, wait_ticks: number) {
        if (name === ''){
            return false
        }
        let point_data = {
            'name': name,
            'location': Array.isArray(loc) ? loc : v3_to_array(loc),
            'dimension': typeof (dim) === 'string' ? dim : dim.id,
            'entity': typeof (entity) === 'string' ? entity : entity.typeId,
            'wait_ticks': wait_ticks
        }
        if (world.getDynamicPropertyIds().indexOf('spawn_points') != -1) {
            let spawn_points = this.getData()
            if (Object.keys(spawn_points).indexOf(name) !== -1) {
                return false
            } else {
                spawn_points[name] = point_data
                world.setDynamicProperty('spawn_points', JSON.stringify(spawn_points))
                return true
            }
        } else {
            let spawn_points: { [name: string]: Object } = {}
            spawn_points[name] = point_data
            world.setDynamicProperty('spawn_points', JSON.stringify(spawn_points))
            return true
        }
    }
    static modify(old_name:string,new_name: string | undefined, loc: Vector3 | Array<number>, dim: Dimension | string, entity: Entity | string | undefined, wait_ticks: number | string | undefined){
        let s = this.getData()[old_name]
        if (new_name === '' || new_name === undefined) {
            new_name = old_name
        }
        if (entity === '' || entity === undefined) {
            entity = s.entity
        }
        if (wait_ticks === '' || wait_ticks === undefined) {
            wait_ticks = s.wait_ticks
        }
        try {
            wait_ticks = Number(wait_ticks)
        } catch (error) {
            wait_ticks = s.wait_ticks
        }
        this.delete(old_name)
        if (this.set(new_name,loc,dim,entity,wait_ticks)) {
            return true
        } else {
            return false
        }
    }
    static delete(name:string){
        let spawn_points = SpawnPoint.getData()
        delete spawn_points[name]
        world.setDynamicProperty('spawn_points', JSON.stringify(spawn_points))
    }
}