import * as fs from 'fs';
import * as path from 'path';

//TODO: should retrieve those names from the tsconfig.json file
const inputDir = "src";
const outputDir = "lib";

copyDefinitionFiles("");

function copyDefinitionFiles(dirName: string): void{
  fs.readdirSync(path.join(inputDir, dirName), {withFileTypes: true}).forEach(dirent =>{
      if(dirent.isDirectory()){
          copyDefinitionFiles(path.join(dirName, dirent.name));
      } else if (dirent.isFile() && dirent.name.endsWith("d.ts")){
          const targetDir = path.join(outputDir, dirName);
          fs.mkdirSync(targetDir, {
              recursive: true
          });
          fs.copyFileSync(path.join(inputDir, path.join(dirName, dirent.name)), path.join(targetDir, dirent.name));
      }
  })
}