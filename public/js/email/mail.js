import { back } from "../commonFunctions.js";
import REST from "../rest.js";
import { keyMap } from "../../mappings/keyMap.js";
import { declarations } from "./mailDeclarations.js";

const MailRest = new REST('/mail/folders');
async function main() {
    let folderArray = await getData();
    console.log(folderArray);
    display()
    document.querySelector('#loading').style.display = 'none';
}
main();

async function getData() {
    return MailRest.get();
}

function display() {
    events();
}

function events() {
    console.log(document.querySelector('mail-sidebar'))
    document.querySelector('mail-sidebar').addEventListener('mail-event', (e) => {
        console.log(e.detail);
    })
}