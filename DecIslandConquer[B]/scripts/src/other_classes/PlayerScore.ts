import { Player } from "@minecraft/server"
import { if_in, get_score } from "../func"

export class PlayerScore {
    name: string
    team: string
    kill: number
    die: number
    occupy: number
    damage: number
    hide_minus: number
    total_score: number
    hide_score: number
    player: Player
    constructor(player: Player) {
        this.player = player
        this.name = player.nameTag
        this.team = ''
        if (if_in('team_red', player.getTags())) {
            this.team = '§c§l'
        } else if (if_in('team_blue', player.getTags())) {
            this.team = '§b§l'
        }
        this.kill = get_score('kill_board', player.nameTag)
        if (isNaN(this.kill)) {
            this.kill = 0
        }
        this.die = get_score('die_board', player.nameTag)
        if (isNaN(this.die)) {
            this.die = 0
        }
        this.occupy = get_score('occupy_board', player.nameTag)
        if (isNaN(this.occupy)) {
            this.occupy = 0
        }
        this.damage = get_score('damage_board', player.nameTag)
        if (isNaN(this.occupy)) {
            this.damage = 0
        }
        this.hide_minus = get_score('hide_minus_board', player.nameTag)
        if (isNaN(this.hide_minus)) {
            this.hide_minus = 0
        }
        this.total_score = 15 * this.kill + this.occupy - 3 * this.die
        this.hide_score = 30 * this.kill + this.occupy - 10 * this.die + 1 * this.damage + 0.3 * this.hide_minus //parameter can be modified later

    }
    setScoreToPlayer(){
        this.player.setDynamicProperty('conquer_score',this.hide_score)
    }
}