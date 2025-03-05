import { getData, option_fragment, PostData, updateContact } from '../commonFunctions.js';
import { ContactMap } from '../../mappings/keyMap.js';
let Accounts, Acc_Type, Acc_Industry, Acc_Ownership, Contacts, clicked = null, acc_ID;
const contact = document.querySelector('#contact');
const Acc_Name = document.querySelector('#org-name');
const Acc_Email = document.querySelector('#org-email');
const popup = document.querySelector('.Contacts_Popup');
let contacts_id_array = [], temp_array = new Set();
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
    contact.addEventListener('click', (e) => {
        e.preventDefault();
        loadContacts();
        popup.classList.remove('hidden');
    })
    document.querySelector('#cancel-contact-popup').addEventListener('click', associateContact)
    document.querySelector('#contact-associate-btn').addEventListener('click', associateContact)
    function associateContact(e) {
        e.preventDefault();
        const checked_contact = document.querySelectorAll(`input[name='contact']:checked`);
        let names = [];
        let arr = [];
        if (e.target.id === 'contact-associate-btn') {
            checked_contact.forEach(item => {
                arr.push(item.id);
                Contacts.forEach(con => {
                    String(con._id) === String(item.id) && names.push(ContactMap['Full Name'](con))
                })
            });
            contacts_id_array = [...arr];
            contact.value = names.join(',');
        } else if (e.target.id === 'cancel-contact-popup') {
            contacts_id_array = [];
            contact.value = '';
            document.querySelector('#contact-associate-btn').disabled = true;
        }
        popup.classList.add('hidden');
    }
    document.querySelector('#ownership').appendChild(option_fragment(Acc_Ownership, 'type'))
    document.querySelector('#account-type').appendChild(option_fragment(Acc_Type, 'type'))
    document.querySelector('#industry').appendChild(option_fragment(Acc_Industry, 'type'))
    document.querySelector('#parent-account').appendChild(option_fragment(Accounts, 'org-name'))
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
        object_account['contacts'] = [...contacts_id_array];

        let IsValidName = checkRequired(Acc_Name);
        let IsValidEmail = checkRequired(Acc_Email);

        if (IsValidEmail && IsValidName) {
            let Contact_Object = Contacts.filter(item => contacts_id_array.includes(item._id));
            let org_id = await PostData(object_account, 'accounts');
            if (contacts_id_array.length > 0) {
                let updateContactPromise = Contact_Object.map(item => {
                    item['org-id'] = org_id;
                    return updateContact(item._id, item);
                });
                let success = await Promise.all(updateContactPromise);
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
function loadContacts() {
    let fragment = document.createDocumentFragment();
    if (Contacts.length > 0) {
        for (const item of Contacts) {
            const row = document.createElement('div');
            row.className = 'row';
            if (contacts_id_array.includes(item._id)) {
                row.innerHTML = `<span><input type="checkbox" name="contact" id="${item._id}" checked="${contacts_id_array.includes(item._id)}"></span><span>${ContactMap['Full Name'](item)}</span>
            <span class="email">${item.email}</span> `;
            } else {
                row.innerHTML = `<span><input type="checkbox" name="contact" id="${item._id}"></span><span>${ContactMap['Full Name'](item)}</span>
            <span class="email">${item.email}</span> `;
            }
            fragment.appendChild(row);
            row.addEventListener('click', (e) => {
                row.querySelector('input[type="checkbox"]').toggleAttribute('checked');
                const checkedItems = document.querySelectorAll(`.check-list_container input[name='contact']:checked`);
                document.querySelector('#contact-associate-btn').disabled = checkedItems.length === 0;
            })
        }
    } else {
        let no_contents = document.createElement('div');
        no_contents.textContent = "No Contacts to Display!";
        no_contents.className = 'no-content';
        no_contents.classList.add('contacts')
        fragment.appendChild(no_contents);
    }
    document.querySelector('.check-list_container').replaceChildren(fragment);
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