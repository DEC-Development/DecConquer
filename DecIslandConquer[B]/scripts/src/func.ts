import { Dimension, Entity, EntityQueryOptions, GameMode, Player, ScoreboardIdentity, ScoreboardObjective, Vector3, system, world } from "@minecraft/server"
import { ConquerSettings } from "./other_classes/ConquerSettings"

export function v3_to_array(v: Vector3) {
    let arr = []
    arr.push(v.x)
    arr.push(v.y)
    arr.push(v.z)
    return arr
}

export function arr_to_v3(arr: Array<number>) {
    let v: Vector3 = {
        x: arr[0],
        y: arr[1],
        z: arr[2]
    }
    return v
}

export function num_to_bool(n: number) {
    if (n == 0) {
        return false
    } else if (n == 1) {
        return true
    } else {
        return undefined
    }
}

function bool_to_num(n: boolean) {
    if (n == false) {
        return 0
    } else if (n == true) {
        return 1
    } else {
        return undefined
    }
}

export function reset_gamer(p: Player) {
    p.setDynamicProperty('conquer_id', world.getDynamicProperty('conquer_id'))
    world.scoreboard.getObjective('die_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
    world.scoreboard.getObjective('kill_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
    world.scoreboard.getObjective('damage_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
    world.scoreboard.getObjective('occupy_board')?.setScore(<ScoreboardIdentity>p.scoreboardIdentity, 0)
    p.removeTag('team_blue')
    p.removeTag('team_red')
    p.removeTag('gamer')
    if (ConquerSettings.getSettings()['clear_after_game']) {
        p.getComponent('inventory')?.container?.clearAll()
        p.getEffects().forEach(e=>{
            try {
                p.removeEffect(e.typeId)
            } catch (error) {
                
            }
        })
    }
    p.teleport(world.getDefaultSpawnLocation())
}

export function get_score(sb_id: string, name: string) {
    let p = NaN
    let sbs_raw = world.scoreboard.getObjectives()
    let sbs = new Array<string>
    sbs_raw.forEach(sb => {
        sbs.push(sb.id)
    })
    if (if_in(sb_id, sbs)) {
        (<ScoreboardObjective>world.scoreboard.getObjective(sb_id)).getScores().forEach(f => {
            if (f.participant.displayName == name) {
                p = f.score
            }
        })
    }
    return p
}

export function if_in(ele: any, lis: Array<any>) {
    let test = false
    for (let l of lis) {
        if (l == ele) {
            test = true
            break
        }
    }
    return test
}

export function mult_run_command(exe: Player | Entity | Dimension, commands: Array<string>, times: number = 1) {
    while (times >= 1) {
        for (let c of commands) {
            exe.runCommandAsync(c).catch(e => console.warn(e))
        }
        times = times - 1
    }
}

export function in_range(input: number, min: number, max: number) {
    if (min <= input && input <= max) {
        return true
    } else {
        return false
    }
}

export function check_init(value: number, init_value: number) {
    if (value < 0 || isNaN(value)) {
        value = init_value
    }
    return value
}

export function str_repeat(str: String, times: number) {
    let s = ''
    let i = 0
    while (i < times) {
        s += str
        i++
    }
    return s
}

export function game_end() {
    world.getAllPlayers().forEach(p => {
        if (world.getPlayers({ gameMode: GameMode.adventure }).indexOf(p) !== -1) {
            p.runCommandAsync('camera @s fade time 1 1 1 color 0 0 0')
            system.runTimeout(() => {
                reset_gamer(p)
            }, 20)
        }
    })
}

const gamer: EntityQueryOptions = {
    gameMode: GameMode.adventure
}
export function get_score_arr() {
    /*
    返回[已排序好玩家分数的数组,中位数]
    */
    let l = 0
    let sc_arr = new Array<number>
    world.getPlayers(gamer).forEach(g => {
        if (g.getDynamicProperty('conquer_score') !== undefined) {
            sc_arr.push(<number>g.getDynamicProperty('conquer_score'))
            l++
        }
    })
    sc_arr.sort((a, b) => a - b)
    let m = 0
    let middle = Math.floor(sc_arr.length / 2)
    if (sc_arr.length % 2 === 0) {
        m = (sc_arr[middle - 1] + sc_arr[middle]) / 2
    } else {
        m = sc_arr[middle]
    }
    if (l === 0) {
        m = 0
    }
    return [sc_arr, m]
}