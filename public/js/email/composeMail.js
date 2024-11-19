import { getUserDetails, events } from '../../js/email/sendMail.js';
import { declarations } from '../../js/email/mailDeclarations.js';
import { getParams } from '../commonFunctions.js';

const params = getParams(window.location.search);
const msgID = params.mid;
const fId = params.fid;
const action = params.action;
let msgDetail, msgMeta;

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
        if (msgID) await mailActions();
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

    async function getMail(meta = null) { // for Forwarding Mail
        if (meta === null) {
            try {
                let response = await fetch(`/mail/view/message/${msgID}/${fId}`)
                if (!response.ok) throw new Error("Error" + response)
                let res = await response.json();
                return res.data;
            } catch (e) {
                console.error(e);
            }
        }
        else if (meta === 'meta') {
            try {
                let response = await fetch(`/mail/view/message/meta/${msgID}/${fId}`)
                if (!response.ok) throw new Error("Error" + response)
                let res = await response.json();
                return res.data;
            } catch (error) {
                console.error(error);
            }
        }
    }

    async function mailActions() {
        msgDetail = await getMail()  // For Forwarding Mail
        if (msgID) {
            declarations.mail_content().value = msgDetail.content;
        }
        msgMeta = await getMail('meta')
        switch (action) {
            case 'reply':
                declarations.to_address().value = msgMeta.fromAddress;
                break;
            case 'reply-all':
                declarations.to_address().value = msgMeta.fromAddress;
                let cleanedStr = msgMeta.ccAddress.replace(/&lt;|&gt;/g, "");
                let result = cleanedStr.split(',').map(email => email.trim()).join(',');
                declarations.cc_address().value = result;
                break;
            default:
                break;
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
