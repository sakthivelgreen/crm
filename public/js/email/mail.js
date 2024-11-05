import { back } from "../commonFunctions.js";
import REST from "../rest.js";
import { declarations } from "./mailDeclarations.js";
import { customMailList } from "../../components/custom_listview.js";

let folderID, folderName;
const MailFoldersRest = new REST('/mail/folders');
const MailMsgRest = new REST('/mail/view');
async function main() {
    let folderArray = await getData();
    await display(folderArray.data)
    events();
    document.querySelector('#loading').style.display = 'none';
}
main();

async function getData() {
    return MailFoldersRest.get();
}

async function display(dataArray) {
    folderID = folderID ?? dataArray[0].folderId;
    const msg = await getMessages(folderID);
    const list = new customMailList();
    list.value = msg.data;
    document.querySelector('.list').appendChild(list);
}

async function getMessages(id) {
    try {
        return await MailMsgRest.getByID(id);
    } catch (e) {
        console.error(e)
    }
}

function events() {
    declarations.mailSidebar().addEventListener('mail-event', (e) => {
        folderID = e.detail.folderId;
        folderName = e.detail.folderName;
        document.querySelector('.list').replaceChildren();
        display();
    })
}