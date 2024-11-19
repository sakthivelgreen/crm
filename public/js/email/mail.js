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
    declarations.mailSidebar().addEventListener('compose-btn', (e) => {
        if (e.detail.compose) {
            window.open('/templates/email/sendMail.html', '_self');
        }
    })
}

function openMailEvent() {
    declarations.mailList().addEventListener('open-mail', async (e) => {

        msgID = e.detail.msgID;
        let dt = await getMessageDetail();

        let sidePop = declarations.rightPopUp();
        let style = `
        .mail-actions{
            position:sticky;
            top:0px;
            z-index:1;
            height: 70px;
            border-bottom:1px solid black;
            background: #fff;
            display: flex;
            gap:10px;
            align-items:center;
            justify-content: right;
            padding-right: 20px;
        }
        button{
            all: unset;
            padding: 5px 10px;
            border: 1px dashed black;    
        }
            button:hover{
                cursor: pointer;
                color: blue;
                transition: 0.5s;
                border-radius: 5px;
                border-color: blue;
                background: rgba(0,0,255,0.3)
            }
            #delete-mail:hover{
                color: red;
                background: rgba(255,0,0,0.1)
            }
        `
        let Content = `
            <style>${style}</style>
            <div class='mail-actions'>
                <button id='forward-mail'>Forward</button>
                <button id='delete-mail'>Delete</button>
                <button id='reply-mail'>Reply</button>
                <button id='reply-all-mail'>Reply All</button>
            </div>
            <div class='content' style="position:relative; height:calc(100% - 90px);width:100%; overflow:auto; padding: 0px 15px">
                ${dt.data.content}
            <div>
            `;

        if (sidePop) {
            sidePop.content = Content;
        } else {
            sidePop = document.createElement('right-popup');
            sidePop.content = Content;
            declarations.mainContainer().appendChild(sidePop);
        }
        mailEvents(sidePop); // Mail Events
    });
}

// Forward Mail & Delete Events
function mailEvents(sidebar) {
    sidebar.shadowRoot.querySelector(".mail-actions").addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.id === 'forward-mail') {
            window.open(`/templates/email/sendMail.html?mid=${msgID}&fid=${folderID}`, '_self');
        }
        if (e.target.id === 'delete-mail') {
            alert('Delete is still in progress! Try again after sometime')
        }
        if (e.target.id === 'reply-mail') {
            window.open(`/templates/email/sendMail.html?mid=${msgID}&fid=${folderID}&action=reply`, '_self');
        }
        if (e.target.id === 'reply-all-mail') {
            window.open(`/templates/email/sendMail.html?mid=${msgID}&fid=${folderID}&action=reply-all`, '_self');
        }
    })
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