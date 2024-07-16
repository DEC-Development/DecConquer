scoreboard players set @e[type=dec:conquer_crystal] global 0
kill @e[type=dec:player_ghost]
kill @e[type=dec:gravestone]
tellraw @s { "rawtext" : [ { "translate" : "text.dec:conquer_introduce.name" } ] }
tellraw @a { "rawtext" : [ { "translate" : "text.dec:game_start.name" } ] }
titleraw @a title { "rawtext" : [ { "translate" : "text.dec:game_start.name" } ] }