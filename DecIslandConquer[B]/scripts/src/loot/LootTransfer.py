import os
import sys
os.chdir(sys.path[0])

loot_file_system_import = ''
loot_file_system_content = 'export default {'

for (path, folders, files) in os.walk('loot_tables'):
    for file in files:
        path_new = path + '/' + file
        path_new = path_new.replace('\\', '/')
        if path_new[-4:] == 'json':
            txt = ''
            with open(path_new, 'r') as file:
                txt = file.read()
            with open(path_new, 'w') as file:
                txt = 'export default ' + txt
                file.write(txt)
            loot_file_system_import += 'import ' + \
                path_new[12:-5].replace('/', '_') + \
                ' from \'./' + path_new[:-2] + '\'\n'
            loot_file_system_content += '"'+path_new + \
                '": '+path_new[12:-5].replace('/', '_')+','
            os.rename(path_new, path_new[:-4]+'ts')

loot_file_system_content = loot_file_system_content[0:-1]
loot_file_system_content += '\n}'
system_content = loot_file_system_import + '\n' + loot_file_system_content
with open('lootFileSystem.ts', 'w') as file:
    file.write(system_content)