import { world, ScoreboardIdentity } from "@minecraft/server"
import { SpawnPoint } from "../elements/SpawnPoint"
import { MathUtil } from "./MathUtil"
import { game_end, mult_run_command } from "../func"
import { Team } from "./Team"

export class ConquerGame {
    constructor() { }
    static start(max_score: any) {
        if (typeof (max_score) !== 'number' && typeof (max_score) !== 'string') {
            return false
        } else {
            try {
                max_score = Number(max_score)
            } catch (error) {
                return false
            }
            if (max_score <= 0) {
                return false
            }
            SpawnPoint.clearAllSpawnedEntities()
            world.scoreboard.getObjective('team_score')?.setScore('§b§lBlueTeam', max_score)
            world.scoreboard.getObjective('team_score')?.setScore('§c§lRedTeam', max_score)
            world.getDimension('overworld').runCommandAsync('function game/start')
            if(world.getDynamicProperty('spawn_points') != undefined){
                let spawn_points = JSON.parse(<string>world.getDynamicProperty('spawn_points'))
                Object.keys(spawn_points).forEach(k => {
                    SpawnPoint.spawnEntity(spawn_points[k])
                })
            }
            let con_id = MathUtil.randomInteger(-10000, 10000)
            world.getAllPlayers().forEach(p => {
                p.setDynamicProperty('conquer_id', con_id)
                world.scoreboard.getObjective('die_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
                world.scoreboard.getObjective('kill_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
                world.scoreboard.getObjective('damage_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
                world.scoreboard.getObjective('occupy_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
                world.scoreboard.getObjective('hide_minus_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
            })
            world.scoreboard.getObjective('global')?.setScore('game_state', 1)
            world.scoreboard.getObjective('global')?.setScore('score_judge_ticks', 100)
            world.setDynamicProperty('conquer_id', con_id)
            return true
        }
    }
    static stop() {
        Team.scoreList()
        mult_run_command(world.getDimension('overworld'), [
            'tellraw @a { "rawtext" : [ { "translate" : "text.dec:conquer_stop.name" } ] }',
            'function game/team_reset_all'
        ])
        game_end()
    }
}