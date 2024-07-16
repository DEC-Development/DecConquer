import { ModalFormData } from "@minecraft/server-ui";
import { get_score, if_in } from "../func";
import { MathUtil } from "../other_classes/MathUtil";
import { Team } from "../other_classes/Team";
import { ConquerSettings } from "../other_classes/ConquerSettings";
export class crystal_perspective_book {
    constructor() { }
    static crystal_perspective_book_index(player) {
        let tags = player.getTags();
        if (get_score('global', 'game_state') == 0 || isNaN(get_score('global', 'game_state')) || (if_in('team_red', tags) == false && if_in('team_blue', tags) == false)) {
            if (!ConquerSettings.getSettings()['auto_detachment']) {
                let index = new ModalFormData();
                index.dropdown('text.dec:crystal_perspective_book_choose_team.name', [
                    'text.dec:crystal_perspective_book_choose_team_blue.name',
                    'text.dec:crystal_perspective_book_choose_team_red.name'
                ], MathUtil.randomInteger(0, 1));
                index.show(player).then(t => {
                    if (t.canceled) {
                        Team.playerStatistics(player);
                        return;
                    }
                    if (t.formValues[0] == 0) {
                        Team.joinBlue(player);
                    }
                    else if (t.formValues[0] == 1) {
                        Team.joinRed(player);
                    }
                });
            }
            else {
                player.runCommandAsync('titleraw @s actionbar { "rawtext" : [ { "translate" : "text.dec:crystal_perspective_book_auto_detachment.name" } ] }');
            }
        }
        else if (get_score('global', 'game_state') == 1 && ((if_in('team_red', tags) || if_in('team_blue', tags)))) {
            let index = new ModalFormData();
            index.dropdown('text.dec:crystal_perspective_book_action.name', [
                'text.dec:crystal_perspective_book_team_list.name',
                'text.dec:crystal_perspective_book_suicide.name'
            ], 0);
            index.show(player).then(t => {
                if (t.canceled) {
                    return;
                }
                else if (t.formValues[0] == 0) {
                    Team.playerStatistics(player);
                }
                else if (t.formValues[0] == 1) {
                    player.runCommandAsync('kill @s');
                }
            });
        }
    }
}
//# sourceMappingURL=crystal_perspective_book.js.map