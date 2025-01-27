import { getData, option_fragment, trackChanges, UpdateAccount } from '../commonFunctions.js';
import { Elements } from '../declarations.js';
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let contactID = urlParams.get('id');

const lastNameInput = document.querySelector("#last-name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const titleElement = document.querySelector('title');
const cancel = document.querySelector("#cancelBtn");
const orgForm = document.querySelector('#org-form');
const contactSaveAndNew = document.querySelector("#btnSaveAndNew");
const saveContact = document.querySelector("#saveContactBtn");
const contactSaveForm = document.querySelector("#createContactForm");

let url = "/mongodb/contacts/" + contactID;
let Contact, contactSource, clicked = null, Accounts;

async function main() {
    Contact = await fetchContacts();
    Accounts = await getData('accounts');
    contactSource = await getData('contact-sources');
    setFormData(Contact);
    events();
}
main();

async function fetchContacts() {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}

function setFormData(data) {
    titleElement.textContent = `Edit - ${data['first-name']} ${data['last-name']}`;
    document.querySelector('#contact-source').appendChild(option_fragment(contactSource, 'name'));
    document.querySelector('#org-option').appendChild(option_fragment(Accounts, 'org-name'));
    document.querySelector('#org-option').value = data['org-name'];
    AutoFill(Contact);
}

function events() {
    document.querySelector('#org-option').addEventListener('change', (e) => {
        e.preventDefault();
        let value = e.target.value;
        enable_disable_form(e.target)
        if (value !== '') {
            let org = Accounts.reduce((found, acc) => {
                return acc._id === e.target.selectedOptions[0].id ? acc : found;
            }, null);
            delete org['last-modified']
            delete org['date-created']
            AutoFill(org)
            document.querySelector('#designation').value = Contact.designation;
        } else {
            Elements.orgName().removeAttribute('required', '');
            Elements.orgName().value = '';
            orgForm.reset();
        }
    })
    // cancel Button
    cancel.addEventListener("click", () => {
        window.location.href = "/templates/contacts/viewcontactDetail.html?id=" + contactID;
    })
    flatpickr('#date-created', {
        clickOpens: false,
        dateFormat: "M d, Y H:i"
    });
    flatpickr('#last-modified', {
        clickOpens: false,
        dateFormat: "M d, Y H:i"
    });
    saveContact.addEventListener("click", () => {
        clicked = 1;
        contactSaveForm.requestSubmit();
    })
    contactSaveAndNew.addEventListener("click", () => {
        clicked = 0;
        contactSaveForm.requestSubmit();
    })

    contactSaveForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const subFormData = new FormData(orgForm);

        let object_contact = Object.fromEntries(formData.entries());
        let object_account = Object.fromEntries(subFormData.entries());
        object_contact['org-id'] = document.querySelector('#org-option').selectedOptions[0].id
        object_contact['designation'] = subFormData.get('designation');
        object_contact['email-opt'] = formData.get('email-opt') === 'on' ? true : false;
        delete object_account['designation'];

        let lastName = checkRequired(lastNameInput);
        let Email = checkRequired(emailInput);
        let Phone = checkRequired(phoneInput)
        if (lastName && Email && Phone) {
            let track = trackChanges(object_contact, Contact);
            if (Object.keys(track).length > 1) {
                await handleContactUpdate(Contact, object_contact, Accounts);
            } else {
                alert('No Changes Found!')
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
// Save contact
async function updateRecord(updatedContact) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedContact)
        })
        if (!response.ok) throw new Error(response.statusText);
        alert("Updated Successfully");
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to add contact. Please try again.")
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
    tag.placeholder = message;
    tag.classList.add("errorInput");
}
function setSuccess(tag) {
    tag.placeholder = "";
    tag.classList.remove("errorInput");
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
        const value = data[key];
        const field = document.querySelector(`[name="${key}"], #${key}`);

        if (field) {
            // If the field is a checkbox or radio button
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = value;
            } else {
                // Otherwise, for inputs, textareas, selects, set the value
                field.value = value;
                if (field.name === 'org-name') {
                    enable_disable_form(field);
                }
            }
            if (key.includes('date') || key.includes('last-modified')) {
                flatpickr(field, {
                    clickOpens: false,
                    dateFormat: "M d, Y H:i"
                })
            }
        }

    });
}

// Ensure all necessary updates happen based on the contact and current account changes
async function handleContactUpdate(contact, current, accounts) {
    let success = false;

    // If the org-id is unchanged, update the contact directly
    if (contact['org-id'] === current['org-id']) {
        success = await updateRecord(current);
    }
    // If the current org-id is empty but the contact has an org-id, remove the contact from the associated account
    else if (current['org-id'] === '' && contact['org-id'] !== '') {
        const oldAccount = accounts.find(a => a._id === contact['org-id']);
        if (oldAccount) {
            oldAccount.contacts = oldAccount.contacts.filter(item => item !== contactID);
            const accountUpdated = await UpdateAccount(contact['org-id'], oldAccount);
            if (accountUpdated) {
                success = await updateRecord(current);
            }
        }
    }
    // If the org-id has changed
    else if (contact['org-id'] !== current['org-id']) {
        // Remove the contact from the old account, if present
        if (contact['org-id'] !== '') {
            const oldAccount = accounts.find(a => a._id === contact['org-id']);
            if (oldAccount) {
                oldAccount.contacts = oldAccount.contacts.filter(item => item !== contactID);
                await UpdateAccount(contact['org-id'], oldAccount);
            }
        }

        // Add the contact to the new account
        if (current['org-id'] !== '') {
            const newAccount = accounts.find(a => a._id === current['org-id']);
            if (newAccount) {
                newAccount.contacts.push(contactID);
                const accountUpdated = await UpdateAccount(current['org-id'], newAccount);
                if (accountUpdated) {
                    success = await updateRecord(current);
                }
            }
        }
    }

    // Redirect to contact detail page if the update was successful
    if (success) {
        window.location.href = `/templates/contacts/viewcontactDetail.html?id=${contactID}`;
    }
}

