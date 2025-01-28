import { getData, option_fragment, PostData, updateContact } from '../commonFunctions.js';

let Accounts, Acc_Type, Acc_Industry, Acc_Ownership, Contacts, clicked = null, acc_ID;
const contact = document.querySelector('#contact');
const Acc_Name = document.querySelector('#org-name');
const Acc_Email = document.querySelector('#org-email');
async function main() {
    await retrieveDB();
    events();
} main();

async function retrieveDB() {
    Accounts = await getData('accounts')
    Acc_Type = await getData('account_type')
    Acc_Industry = await getData('industry_type')
    Acc_Ownership = await getData('account_ownership')
    Contacts = await getData('contacts');
}

function events() {
    document.querySelector('#cancelBtn').addEventListener('click', () => {
        if (document.referrer !== '') {
            window.location.assign(document.referrer)
        } else {
            window.location.href = '/templates/accounts.html'
        }
    });
    document.querySelector('#ownership').appendChild(option_fragment(Acc_Ownership, 'type'))
    document.querySelector('#account-type').appendChild(option_fragment(Acc_Type, 'type'))
    document.querySelector('#industry').appendChild(option_fragment(Acc_Industry, 'type'))
    document.querySelector('#parent-account').appendChild(option_fragment(Accounts, 'org-name'))
    document.querySelector('#contact').appendChild(option_fragment(Contacts, 'last-name'))
    flatpickr(document.querySelector('#date-created'), {
        clickOpens: false,
        dateFormat: "M d, Y",
        defaultDate: new Date()
    })
    flatpickr(document.querySelector('#last-modified'), {
        clickOpens: false,
        dateFormat: "M d, Y",
        defaultDate: new Date()
    })

    document.querySelector('#saveAccountBtn').addEventListener('click', (e) => {
        e.preventDefault();
        clicked = 1;
        document.querySelector('#createAccountForm').requestSubmit();
    })
    document.querySelector('#btnSaveAndNew').addEventListener('click', (e) => {
        e.preventDefault();
        clicked = 0;
        document.querySelector('#createAccountForm').requestSubmit();
    })

    document.querySelector('#createAccountForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        let object_account = Object.fromEntries(formData.entries());
        object_account['contacts'] = [];
        if (contact.value) object_account['contacts'].push(contact.selectedOptions[0].id);
        delete object_account['contact']
        let IsValidName = checkRequired(Acc_Name);
        let IsValidEmail = checkRequired(Acc_Email);

        if (IsValidEmail && IsValidName) {
            if (contact.value && !checkRequired(contact)) return;
            let Contact_Object = Contacts.find(item => item._id === contact.selectedOptions[0].id);
            let org_id = await PostData(object_account, 'accounts');
            if (contact.value && checkRequired(contact)) {
                Contact_Object['org-id'] = org_id;
                let success = await updateContact(Contact_Object._id, Contact_Object)
                if (success) {
                    window.location.href = clicked
                        ? `/templates/accounts/viewAccounts.html?id=${org_id}`
                        : "/templates/accounts/createAccount.html";
                }
            }
            if (org_id) {
                window.location.href = clicked
                    ? `/templates/accounts/viewAccounts.html?id=${org_id}`
                    : "/templates/accounts/createAccount.html";
            }
        }
    })
}


function checkRequired(tag) {
    let val = tag.value;
    let id;
    if (tag.tagName === 'SELECT') id = tag.selectedOptions[0].id;
    if (val === "") {
        // setError(tag, "required");
        tag.setCustomValidity('Enter a Value!')
        tag.reportValidity();
        return false;
    } else {
        setSuccess(tag);
        switch (tag.id) {
            case "org-email":
                if (!checkMail(val, tag)) return;
                break;
            case 'org-name':
                if (!checkOrg(val, tag)) return;
                break;
            case 'contact':
                if (!checkContact(id, tag)) return;
                break;
            default:
                break;
        }
        tag.setCustomValidity('')
        return true;
    }
}
function checkMail(email, tag) {
    if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(email)) {
        setError(tag, "Invalid Email");
        return false;
    }
    for (let item of Accounts) {
        if (item['org-email'] === email) {
            setError(tag, "Email Already registered!");
            return false;
        }
    }
    setSuccess(tag);
    return true;
}
function checkOrg(name, tag) {
    for (const acc of Accounts) {
        if (acc['org-name'].toLowerCase().includes(name.toLowerCase())) {
            setError(tag, 'Account Name Already exists! try different')
            return false;
        }
    }
    setSuccess(tag);
    return true;
}
function checkContact(id, tag) {
    let contact = Contacts.find(item => item._id == id);
    if (contact && contact['org-id'] !== '') {
        setError(tag, 'Contact Associated with Another Account!');
        return false;
    }
    setSuccess(tag);
    return true;
}

function setError(tag, message) {
    let Error_tag = tag.parentElement.querySelector('.field-error');
    Error_tag.textContent = message;
    Error_tag.classList.remove("hidden-visibility");
}
function setSuccess(tag) {
    let Error_tag = tag.parentElement.querySelector('.field-error');
    Error_tag.textContent = '';
    Error_tag.classList.add("hidden-visibility");
}