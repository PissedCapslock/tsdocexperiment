import {Extractor, ExtractorConfig, ExtractorResult} from '@microsoft/api-extractor';
import * as path from 'path';
import * as fs from 'fs';
import {JsonFile} from '@microsoft/node-core-library';

const definitionFiles: string[] = [];
collectDefinitionFiles("lib", "", definitionFiles);

const overridesPath = path.resolve(`./config/api-extractor.json`);
const apiExtractorConfig = fs.existsSync(overridesPath) ? JsonFile.load(overridesPath) : {};

for (const definitionFile of definitionFiles) {
    apiExtractorConfig.mainEntryPointFilePath = "<projectFolder>/" + definitionFile;
    
    apiExtractorConfig.apiReport.reportTempFolder = "<projectFolder>/etc/" + path.dirname(definitionFile.replace("lib/", ""));
    apiExtractorConfig.apiReport.reportFileName = definitionFile.replace(path.dirname(definitionFile) + "/","").replace(".d.ts", ".api.md");
    
    apiExtractorConfig.docModel.apiJsonFilePath = "<projectFolder>/temp/" + definitionFile.replace("lib/", "").replace(".d.ts", ".api.json");

    const tempApiExtractorConfigFile = './config/api-extractor-temp.json';
    JsonFile.save(apiExtractorConfig, tempApiExtractorConfigFile, { ensureFolderExists: true });

    // Run the API Extractor command-line
    const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(tempApiExtractorConfigFile);

    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
        localBuild: true,
        showVerboseMessages: true
    });

    if (extractorResult.succeeded) {
        console.error(`API Extractor completed successfully`);
        process.exitCode = 0;
    } else {
        console.error(`API Extractor completed with ${extractorResult.errorCount} errors`
            + ` and ${extractorResult.warningCount} warnings`);
        process.exitCode = 1;
    }

    fs.unlinkSync(tempApiExtractorConfigFile);
}

function collectDefinitionFiles(rootDir: string, dirName: string, definitionFiles: string[]): void {
    fs.readdirSync(path.join(rootDir, dirName), { withFileTypes: true }).forEach(dirent => {
        if (dirent.isDirectory()) {
            collectDefinitionFiles(rootDir, path.join(dirName, dirent.name), definitionFiles);
        } else if (dirent.isFile() && dirent.name.endsWith("d.ts")) {
            const definitionFile = path.join(path.join(rootDir, dirName), dirent.name);
            definitionFiles.push(definitionFile);
        }
    })
}
