import { world } from "@minecraft/server";
import { mult_run_command } from "../func";
export class TeleportPoint {
    static rename(name, old_name) {
        let loc = TeleportPoint.getLocation(old_name);
        TeleportPoint.delete(old_name);
        this.create(name, loc);
    }
    static delete(name) {
        mult_run_command(world.getDimension('overworld'), [
            'scoreboard players reset tpp_' + name + '_x global',
            'scoreboard players reset tpp_' + name + '_y global',
            'scoreboard players reset tpp_' + name + '_z global'
        ]);
    }
    static teleport(en, name) {
        en.teleport(TeleportPoint.getLocation(name));
    }
    static getLocation(name) {
        let data = TeleportPoint.getData();
        let x = data[name]['x'];
        let y = data[name]['y'];
        let z = data[name]['z'];
        let v = {
            x: x,
            y: y,
            z: z,
        };
        return v;
    }
    static create(name, loc) {
        mult_run_command(world.getDimension('overworld'), [
            'scoreboard players set tpp_' + name + '_x global ' + String(loc.x),
            'scoreboard players set tpp_' + name + '_y global ' + String(loc.y),
            'scoreboard players set tpp_' + name + '_z global ' + String(loc.z),
        ]);
    }
    static getData(manage_body) {
        let tpp_coor = {};
        world.scoreboard.getObjective('global').getScores().forEach(o => {
            if (o.participant.displayName.slice(0, 4) == 'tpp_') {
                let name = o.participant.displayName.slice(4, -2);
                let c = o.participant.displayName.slice(-1);
                let num = o.score;
                if (name in tpp_coor == false) {
                    tpp_coor[name] = {};
                    if (manage_body != undefined) {
                        manage_body.push('Tppoint ' + name);
                    }
                }
                tpp_coor[name][c] = num;
            }
        });
        return tpp_coor;
    }
}
//# sourceMappingURL=TeleportPoint.js.map