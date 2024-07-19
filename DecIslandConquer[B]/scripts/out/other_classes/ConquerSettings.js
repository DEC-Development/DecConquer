import { check_init, get_score, num_to_bool } from "../func";
export class ConquerSettings {
    constructor() { }
    static getSettings() {
        let die_deduct = get_score('global', 'die_deduct');
        let max_health = get_score('global', 'max_health');
        let maxmagic = get_score('global', 'maxmagic');
        let random_equipment = get_score('global', 'random_equipment');
        let auto_detachment = get_score('global', 'auto_detachment');
        let clear_after_game = get_score('global', 'clear_after_game');
        let equipment_queue = get_score('global', 'equipment_queue');
        die_deduct = check_init(die_deduct, 5);
        max_health = check_init(max_health, 10);
        maxmagic = check_init(maxmagic, 20);
        random_equipment = check_init(random_equipment, 0);
        auto_detachment = check_init(auto_detachment, 1);
        clear_after_game = check_init(clear_after_game, 0);
        equipment_queue = check_init(equipment_queue, 1);
        let settings = {
            'die_deduct': die_deduct,
            'max_health': max_health,
            'maxmagic': maxmagic,
            'random_equipment': num_to_bool(random_equipment),
            'auto_detachment': num_to_bool(auto_detachment),
            'clear_after_game': num_to_bool(clear_after_game),
            'equipment_queue': num_to_bool(equipment_queue)
        };
        return settings;
    }
}
//# sourceMappingURL=ConquerSettings.js.map