import { getData, option_fragment, CreateAccount, PostData, UpdateAccount } from '../commonFunctions.js'
import { Elements } from '../declarations.js';

// Cancel Button
const cancel = document.querySelector("#cancelBtn");
cancel.addEventListener("click", () => {
    if (document.referrer !== '') {
        window.location.assign(document.referrer)
    } else {
        window.location.href = "/templates/contacts.html";
    }
})

// Getting Input box Fields
const last_name_Input = document.querySelector("#last-name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");

const contactCreateForm = document.querySelector("#createContactForm");
const saveContact = document.querySelector("#saveContactBtn");
const contact_Save_and_New = document.querySelector("#btnSaveAndNew");
const orgForm = document.querySelector('#org-form');

let clicked = null;
let contactSource, Contacts, Accounts;

async function main() {
    Contacts = await getData('contacts');
    Accounts = await getData('accounts');
    contactSource = await getData('lead-sources');
    document.querySelector('#contact-source').appendChild(option_fragment(contactSource, 'name'));
    document.querySelector('#org-option').appendChild(option_fragment(Accounts, 'org-name'));
    events();
}
main();

function events() {
    flatpickr('#date-created', {
        dateFormat: "M d, Y",
        defaultDate: new Date(),
        clickOpens: false,
    });
    document.querySelector('#org-option').addEventListener('change', (e) => {
        e.preventDefault();
        let value = e.target.value;
        enable_disable_form(e.target)
        if (value === 'new') {
            if (Accounts.length > 0) {
                Object.keys(Accounts[0]).forEach(key => {
                    const field = document.querySelector(`[name="${key}"], #${key}`);
                    if (field) field.removeAttribute('readonly');
                });
            }
            Elements.orgName().removeAttribute('readonly');
            Elements.orgName().focus();
            Elements.orgName().setAttribute('required', '');
            Elements.orgName().value = '';
            orgForm.reset();
        } else if (value !== '') {
            let org = Accounts.find(acc => acc._id === e.target.selectedOptions[0].id);
            if (org) AutoFill(org);
            Object.keys(org).forEach(key => {
                const field = document.querySelector(`[name="${key}"], #${key}`);
                if (field) field.setAttribute('readonly', '');
            });
            Elements.orgName().setAttribute('readonly', '');
            document.querySelector('#designation').value = '';
            document.querySelector('#designation').removeAttribute('readonly');
        } else {
            Elements.orgName().removeAttribute('required');
            Elements.orgName().readonly = true;
            Elements.orgName().value = '';
            orgForm.reset();
        }
    })

    saveContact.addEventListener("click", () => {
        clicked = 1;
        contactCreateForm.requestSubmit();
    })

    contact_Save_and_New.addEventListener("click", () => {
        clicked = 0;
        contactCreateForm.requestSubmit();
    })

    contactCreateForm.addEventListener("submit", createContact)
}


// Function add contact
async function createContact(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subFormData = new FormData(orgForm);
    let object_contact = Object.fromEntries(formData.entries());
    let object_account = Object.fromEntries(subFormData.entries());

    object_contact['org-id'] = document.querySelector('#org-option').selectedOptions[0].id
    object_contact['designation'] = subFormData.get('designation');
    object_contact['email-opt'] = formData.get('email-opt') === 'on' ? true : false;

    delete object_account['designation'];

    let isPhoneValid = checkRequired(phoneInput)
    let isEmailValid = checkRequired(emailInput);
    let isLastNameValid = checkRequired(last_name_Input);
    if (!isLastNameValid || !isEmailValid || !isPhoneValid) {
        console.log('Form validation failed');
        return; // Stop further submission if there are validation errors
    }
    let contactID, result;
    switch (document.querySelector('#org-option').value) {
        case 'new':
            let isOrgValid = checkRequired(Elements.orgName());
            if (!isOrgValid) return;
            object_account['org-name'] = formData.get('org-name');
            object_account['contacts'] = []
            object_account['contacts'] = []

            // create new Account
            let org_id = await CreateAccount(object_account);

            // create new contact
            object_contact['org-id'] = org_id;
            contactID = await PostData(object_contact, 'contacts');

            // update contact id to account
            object_account['contacts'].push(contactID);
            result = await UpdateAccount(org_id, object_account);

            if (result) clicked ? window.location.href = '/templates/contacts/viewcontactDetail.html?id=' + contactID : window.location.href = "/templates/contacts/createcontacts.html";
            break;
        case '':
            result = await PostData(object_contact, 'contacts');
            if (result) clicked ? window.location.href = '/templates/contacts/viewcontactDetail.html?id=' + result : window.location.href = "/templates/contacts/createcontacts.html";
            break;
        default:
            let acc_id = document.querySelector('#org-option').selectedOptions[0].id;;
            let data = Accounts.find((acc) => acc._id == acc_id);
            contactID = await PostData(object_contact, 'contacts');
            data['contacts'].push(contactID);
            delete data._id;
            result = await UpdateAccount(acc_id, data)
            if (result) clicked ? window.location.href = '/templates/contacts/viewcontactDetail.html?id=' + contactID : window.location.href = "/templates/contacts/createcontacts.html";
            break;
    }
}

function checkRequired(tag) {
    let val = tag.value;
    if (val === "") {
        // setError(tag, "required");
        tag.setCustomValidity('Enter a Value!')
        tag.reportValidity();
        return false;
    } else {
        setSuccess(tag);
        switch (tag.id) {
            case "phone":
                if (!checkPhone(val, tag)) return;
                break;
            case "email":
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

function checkPhone(phone, tag) {
    if (/\D/.test(phone)) {
        setError(tag, "Phone Number should contain numbers only.");
        return false;
    }
    if (!/^[6-9]\d{9}/.test(phone)) {
        setError(tag, "Phone number should start with 6-9.");
        return false;
    }
    setSuccess(tag)
    return true;
}
function checkMail(email, tag) {
    if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(email)) {
        setError(tag, "Invalid Email");
        return false;
    }
    for (let item of Contacts) {
        if (item.email === email) {
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

function AutoFill(data) {
    Object.keys(data).forEach(key => {
        if (key !== 'date-created' && key !== 'last-modified') {
            const value = data[key];
            const field = document.querySelector(`[name="${key}"], #${key}`);
            if (field) {
                // If the field is a checkbox or radio button
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = value;
                } else {
                    // Otherwise, for inputs, text-areas, selects, set the value
                    field.value = value;
                }
            }
        }
    })
}

function enable_disable_form(item) {
    if (item.value !== '') {
        Elements.orgName().closest('.form-field').classList.remove('hidden-field');
        document.querySelector('.org-section').classList.remove('hidden-field')
    } else {
        document.querySelector('.org-section').classList.add('hidden-field')
        Elements.orgName().closest('.form-field').classList.add('hidden-field');
    }
}