import { getUserDetails, events } from '../../js/email/sendMail.js';
import { declarations } from '../../js/email/mailDeclarations.js';
import { getParams } from '../commonFunctions.js';

const msgID = getParams(window.location.search).mid;
const fId = getParams(window.location.search).fid;
let Content;

$(document).ready(function () {
    $('.content').load('./sendMailTemplate.html', function (response, status, xhr) {
        if (status === "error") {
            $('#content-container').text('Error loading content: ' + xhr.status + " " + xhr.statusText);
        }
    });
});
document.addEventListener('DOMContentLoaded', (e) => {
    async function main() {
        let user = await getUserDetails();
        if (msgID) {
            Content = await getMail()  // For Forwarding Mail
            const parser = new DOMParser();
            const doc = parser.parseFromString(Content, 'text/html');
            declarations.mail_content().value = Content;
        }
        declarations.from_address().value = user.primaryEmailAddress;
        document.querySelector('#mail-form').style.cssText = `
                    height: 450px;
                    overflow-y: auto;
                    padding: 10px
                `;
        events()
    }
    main()
    async function events() {
        declarations.sendMailBtn().addEventListener('click', async (event) => {
            event.preventDefault();
            let from = declarations.from_address().value;
            let to = declarations.to_address().value;
            let cc = declarations.cc_address().value;
            let sub = declarations.mail_subject().value;
            let msg = declarations.mail_content().value;
            if ((from && to && msg && sub)) {
                let obj = {
                    'fromAddress': from,
                    'toAddress': to,
                    'subject': sub,
                    'content': msg,
                    'ccAddress': cc,
                    "askReceipt": "yes"
                }
                let res = await sendMail(obj);
                res ? window.open('/templates/email/mail.html', '_self') : '';
            }
        })
    }

    async function getMail() { // for Forwarding Mail
        try {
            let response = await fetch(`/mail/view/message/${msgID}/${fId}`)
            if (!response.ok) throw new Error("Error" + response)
            let res = await response.json();
            return res.data.content;
        } catch (e) {
            console.error(e);
        }
    }


    async function sendMail(obj) {
        try {
            let response = await fetch('/mail/sendMail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
            if (!response.ok) throw new Error('Unable to send Mail currently! tryAgain Later!');
            alert('Mail Sent!')
            return true;
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }
})
