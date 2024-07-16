scoreboard players set @s global 0
execute if entity @e[x=~-7,dx=14,z=~-7,dz=14,y=-64,dy=400,type=dec:conquer_crystal,tag=spawned] run tellraw @a { "rawtext" : [ { "translate" : "text.dec:conquer_crystal_place_fail.name" } ] }
execute if entity @e[x=~-7,dx=14,z=~-7,dz=14,y=-64,dy=400,type=dec:conquer_crystal,tag=spawned] run event entity @s minecraft:despawn
tag @s add spawned