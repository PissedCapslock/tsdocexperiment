import * as tsdoc from '@microsoft/tsdoc';
import * as fs from 'fs';

const configuration: tsdoc.TSDocConfiguration = new tsdoc.TSDocConfiguration();
const tsdocParser: tsdoc.TSDocParser = new tsdoc.TSDocParser(configuration);

const fileContents = fs.readFileSync("src/firstmodule.d.ts", "UTF-8");

const parserContext = tsdocParser.parseString(fileContents);

//console.log(parserContext);

const outputLines: string[] = [];
if (parserContext && parserContext.docComment) {
    _dumpTSDocTree(outputLines, parserContext.docComment);
}

console.log(outputLines);

function _dumpTSDocTree(outputLines: string[], docNode: tsdoc.DocNode, indent: string = ''): void {
    let dumpText: string = '';
    if (docNode instanceof tsdoc.DocExcerpt) {
        const content: string = docNode.content.toString();
        dumpText += `${indent}* ${docNode.excerptKind}=` + JSON.stringify(content);
    } else {
        dumpText += `${indent}- ${docNode.kind}`;
    }
    outputLines.push(dumpText);

    for (const child of docNode.getChildNodes()) {
        _dumpTSDocTree(outputLines, child, indent + '  ');
    }
}