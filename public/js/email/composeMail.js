import { getUserDetails, events } from '../../js/email/sendMail.js';
import { declarations } from '../../js/email/mailDeclarations.js';
import { getParams } from '../commonFunctions.js';
import { keyMap } from '../../mappings/keyMap.js'

const params = getParams(window.location.search);
const msgID = params.mid;
const fId = params.fid;
const action = params.action;
let actionMsg;
let msgDetail, msgMeta, mailed_details;
let data = {
    leads: '',
    contacts: '',
    accounts: ''
}

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
        await getFromModules()
        if (msgID) await mailActions();
        declarations.from_address().value = user.primaryEmailAddress;
        declarations.mail_form().style.cssText = `
                    height: 450px;
                    overflow-y: auto;
                    padding: 10px
                `;

        moduleBasedMailSelection()
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
                mailed_details = finalizeCollection();
                if (res.status.code === 200) {
                    let msg = {
                        mailId: res.data.mailId,
                        msgId: res.data.messageId,
                        msg: actionMsg || 'Mail Sent',
                        subject: sub,
                        user_details: mailed_details ?? ''
                    }
                    let result = await storeMongo(msg)
                    result ? window.open('/templates/email/mail.html', '_self') : '';
                };
            } else {
                alert('Fill out required fields')
            }
        })

        document.querySelector('#enableModule').addEventListener('change', (e) => {
            if (e.target.checked) {
                declarations.user_module().disabled = false;
                declarations.mUid().disabled = false;
            }
            else {
                declarations.user_module().disabled = true;
                declarations.mUid().disabled = true;
            }
        })
        declarations.user_module().addEventListener('change', async (e) => {
            let val = e.target.value;
            if (val !== '') {
                declarations.mUid().innerHTML = '';
                if (val !== 'accounts') {
                    declarations.mUid().innerHTML = '<option value="">Choose</option>';
                    const optionsHtml = data[val].map(item =>
                        `<option value="${item._id || ''}">${keyMap.name(item)}</option>`
                    ).join('');
                    declarations.mUid().innerHTML += optionsHtml;
                }
            }
        });
        let collection = new Map();
        let set = new Set();
        declarations.mUid().addEventListener('change', async (e) => {
            let value = e.target.value.trim();
            if (value !== '') {
                let moduleValue = declarations.user_module().value.trim();
                if (!collection.has(value)) {
                    collection.set(value, moduleValue);
                }
                let obj = finalizeCollection();
                for (const key in obj) {
                    data[obj[key]].forEach(item => {
                        if (item._id === key) set.add(item.email)
                    });

                }
                declarations.to_address().value = [...set].join(',')
            }
        });
        function finalizeCollection() {
            const finalObject = Object.fromEntries(collection); // Convert Map to Object
            return finalObject;
        }
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
            actionMsg = "forwarded"
        }
        msgMeta = await getMail('meta')
        switch (action) {
            case 'reply':
                declarations.to_address().value = msgMeta.fromAddress;
                actionMsg = 'reply'
                break;
            case 'reply-all':
                declarations.to_address().value = msgMeta.fromAddress;
                let cleanedStr = msgMeta.ccAddress.replace(/&lt;|&gt;/g, "");
                let result = cleanedStr.split(',').map(email => email.trim()).join(',');
                declarations.cc_address().value = result;
                actionMsg = 'reply-all'
                break;
            default:
                break;
        }
    }

    function moduleBasedMailSelection() {
        const addSelectModule = document.createElement('div');
        addSelectModule.innerHTML = `
        <span><input type='checkbox' id='enableModule'> Select From Modules</span>
        <select id='module-user' disabled>
            <option selected value=''>Select Module</option>
            <option value='leads'>Leads</option>
            <option value='contacts'>Contacts</option>
            <option value='accounts'>Accounts</option>
        </select>
        <select id='mUid' disabled>
            <option selected value=''>Choose...</option>
        </select>
        `;
        let parent = declarations.to_address().parentElement;
        parent.insertBefore(addSelectModule, declarations.to_address())
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
            return await response.json();
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }
})

async function storeMongo(obj) {
    try {
        let response = await fetch(`/mongodb/email_logs`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(obj)
        });
        if (!response.ok) throw new Error(await response.json());
        return true;
    } catch (error) {
        alert(error)
        return false;
    }
}

async function getFromModules() {
    for (const key in data) {
        try {
            let response = await fetch(`/mongodb/${key}`)
            if (!response.ok) throw new Error('Error Getting Users from Module');
            data[key] = await response.json();
        } catch (err) {
            alert('Error: ' + err)
            console.error(err)
        }
    }

}