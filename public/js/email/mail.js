import { back, getParams } from "../commonFunctions.js";
import REST from "../rest.js";
import { declarations } from "./mailDeclarations.js";
import { customMailList } from "../../components/custom_listview.js";
import { mailSidebar } from "../../components/mail_sidebar.js"


let folderID, folderName, msgID, hash;
const MailMsgRest = new REST('/mail/view');

async function main() {
    localStorage.setItem('url', window.location.href);
    let folderArray = await getData();
    await sidebar(folderArray.data);
    await display(folderArray.data)
    events();
    document.querySelector('#loading').style.display = 'none';
}
main();
async function sidebar(val) {
    const sidebar = new mailSidebar();
    sidebar.value = val;
    declarations.aside().appendChild(sidebar);
}
async function getData() {
    try {
        let response = await fetch('/mail/folders');
        if (!response.ok && response.status === 401) {
            response.json().then(data =>
                window.location.href = data.redirect
            )
        }
        return response.json();
    } catch (error) {
        console.error(error);
    }
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
    console.log(msg);

    const list = new customMailList();
    list.value = msg.data;
    document.querySelector('.list').replaceChildren(list);
    openMailEvent();
}

async function getMessages(id) {
    try {
        let response = await fetch(`/mail/view/${id}`)
        if (!response.ok) throw new Error('Error');
        return await response.json()
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

        msgID = e.detail.msgID;
        let dt = await getMessageDetail();

        let sidePop = declarations.rightPopUp();

        if (sidePop) {
            sidePop.content = dt.data.content;
        } else {
            sidePop = document.createElement('right-popup');
            sidePop.content = dt.data.content;
            declarations.mainContainer().appendChild(sidePop);
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