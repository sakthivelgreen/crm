import { timeOptions, dateFormat } from '../commonFunctions.js';
timeOptions.hour12 = false;
export async function main(sidebar, module, mUid) {
    let mod = {
        [mUid]: module
    };
    const To_Address = sidebar.shadowRoot.querySelector('#to-address');
    const Subject = sidebar.shadowRoot.querySelector('#mail-subject');
    const Message = sidebar.shadowRoot.querySelector('#mail-content');
    const From_Address = sidebar.shadowRoot.querySelector('#from-address');
    const CC_Address = sidebar.shadowRoot.querySelector('#cc-address');

    let object = {
        'to': To_Address,
        'sub': Subject,
        'msg': Message,
        'from': From_Address,
        'cc': CC_Address
    };
    let user = await getUserDetails();

    sidebar.shadowRoot.querySelector("#from-address").value = user.primaryEmailAddress;
    await events(sidebar.shadowRoot, object, mod);
}
export async function getUserDetails() {
    try {
        let response = await fetch('/mail/user');
        if (response.status === 401) {
            let result = await response.json();
            alert('Tokens Expired Click OK to Regenerate!')
            localStorage.setItem('url', window.location.href)
            window.open(result.redirect, '_self');
        };
        if (!response.ok) throw new Error(`Unable to fetch user data! ${response.statusText}`);
        return await response.json()
    } catch (error) {
        if (!error === 401) {
            alert(error);
            throw new Error(`Error: ${error}`);
        }
    }
}

export async function events(doc, object, mod) {
    doc.querySelector('#sendMailBtn').addEventListener('click', async (e) => {
        let res = Validate(object);
        if (res.length > 0) {
            alert(`Fill out required fields: ${res.join(', ')}`);
            return;
        };
        let obj = {
            'fromAddress': object['from'].value,
            'toAddress': object['to'].value,
            'subject': object['sub'].value,
            'content': object['msg'].value,
            'ccAddress': object['cc'].value,
            "askReceipt": "yes"
        }

        try {
            let response = await fetch('/mail/sendMail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
            if (!response.ok) throw new Error('Unable to send Mail currently! tryAgain Later!');
            const eve = new CustomEvent('mail-status', {
                detail: { 'status': 'sent' },
                bubbles: true,
                composed: true
            })
            let res = await response.json()
            let mongodbObject = {
                time: dateFormat(new Date(), timeOptions),
                mailId: res.data.mailId,
                msgId: res.data.messageId,
                msg: 'Mail Sent',
                subject: object['sub'].value,
                user_details: mod ?? ''
            }
            await storeMongo(mongodbObject);
            alert('Mail Sent!')
            doc.querySelector('#sendMailBtn').dispatchEvent(eve);
        } catch (error) {
            alert(error);
            console.log(error);
        }
    });
}

function Validate(obj) {
    let emptyFields = [];
    for (const item in obj) {
        if (item == 'cc') continue;
        if (obj[item].value === '') {
            emptyFields.push(obj[item].name || 'Unnamed Field');
            obj[item].classList.add('error');
        } else {
            obj[item].classList.remove('error');
        }
    }
    return emptyFields;
}

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