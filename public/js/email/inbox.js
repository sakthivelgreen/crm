import { back } from "../commonFunctions.js";
import REST from "../rest.js";
import { keyMap } from "../../mappings/keyMap.js";
import { declarations } from "./mailDeclarations.js";

const MailRest = new REST('/mail/folders');
async function main() {
    let folderArray = await getData();
    console.log(folderArray);

    document.querySelector('#loading').style.display = 'none';
}
main();

async function getData() {
    return MailRest.get();
}


