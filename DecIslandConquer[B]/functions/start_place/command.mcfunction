effect @a[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14] instant_health 1 255 true
effect @a[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14] saturation 1 255 true
effect @a[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14] weakness 2 255 true
execute as @a[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14] unless entity @s[hasitem={item=dec:crystal_perspective_book}] run give @s dec:crystal_perspective_book
execute as @a[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14] unless entity @s[hasitem={item=dec:crystal_teleport_book}] run give @s dec:crystal_teleport_book
setworldspawn ~~2~
kill @e[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14,type=dec:gravestone]
kill @e[x=~-2,y=~2,z=~-7,dx=9,dy=4,dz=14,type=dec:player_ghost]