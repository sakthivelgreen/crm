import { back, getParams } from "../commonFunctions.js";
import REST from "../rest.js";
import { declarations } from "./mailDeclarations.js";
import { customMailList } from "../../components/custom_listview.js";

let folderID, folderName, msgID;
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

async function display(dataArray = null) {
    let path = window.location.hash;
    if (path) {
        path = path.split('/');
        folderID = path[1];
    }
    if (!folderID) {
        window.open(`#${dataArray[0].folderName}/${dataArray[0].folderId}`, '_self');
    }
    folderID = folderID ?? dataArray[0].folderId;

    const msg = await getMessages(folderID);
    const list = new customMailList();
    list.value = msg.data;
    document.querySelector('.list').appendChild(list);
    openMailEvent();
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
        window.open(`#${folderName}/${folderID}`, '_self')
        document.querySelector('.list').replaceChildren();
        display();
    })
}

function openMailEvent() {
    declarations.mailList().addEventListener('open-mail', async (e) => {
        console.log("clicked");

        msgID = e.detail.msgID;
        let dt = await getMessageDetail();

        let sidePop = declarations.rightPopUp();

        if (sidePop) {
            sidePop.content = dt.data.content;
        } else {
            sidePop = document.createElement('right-popup');
            sidePop.content = dt.data.content;
            document.body.appendChild(sidePop);
        }
    });
}

async function getMessageDetail() {
    try {
        let response = await fetch(`/mail/view/message/${msgID}/${folderID}`);
        if (!response.ok) throw new Error("Error");
        let result = await response.json();
        return result;
    } catch (error) {
        console.error(error)
    }
}