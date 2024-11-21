import customList from "/components/custom_listview.js";
import REST from '../rest.js';
import { declarations } from './contactDeclarations.js';
import { buttons, Sections } from '../declarations.js';
import { keyMap } from '../../mappings/keyMap.js';
import { buttonRedirect } from "../commonFunctions.js";
import rightPopUP from '../../components/rightPopup.js'

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let contactID = urlParams.get('id');
let isRunning = false;
let Contact;

const backBtn = document.querySelector("#backArrowBtn");
backBtn.addEventListener("click", () => {
    window.location.href = `/templates/contacts.html`;
})


let url = "/mongodb/contacts/" + contactID;

fetchContacts();

async function fetchContacts() {
    let contacts = [];
    try {
        if (isRunning) {
            return;
        }
        isRunning = true;
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        contacts = await response.json();
        getContacts(contacts);
    }
    catch (error) {
        console.error('Error fetching Contacts:', error);
    }
    finally {
        isRunning = false;
    }
}
const titleElement = document.querySelector('title');
const table = document.querySelector("#contactTable");
const tbody = document.createElement("tbody");
table.appendChild(tbody);
// get contact
function getContacts(contact) {
    Contact = contact;
    declarations.pageTitle().textContent = keyMap.name(contact);

    titleElement.textContent = `${keyMap.name(contact)} (contact) - Zoho CRM`;
    for (const key in contact) {
        if (key === "_id" || key === 'organisation_id') continue;
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        td1.textContent = key;
        td2.textContent = contact[key];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
    processDeals(contact._id);
    processAccounts(contact._id);
    processMeetings(contact)
}

// Process Deals
async function processDeals(id) {
    let list = new customList();
    const Deal_Endpoint = new REST('/mongodb/deals');
    let allDeals = await Deal_Endpoint.get();
    let objects = allDeals.filter(deal => deal.contactID == id);
    list.title = ['deal_Name', 'deal_Pipeline', 'deal_Stage', 'deal_Amount'];
    list.redirect = '/templates/deals/viewDeals.html';
    list.value = objects;
    document.querySelector('#dealSection').appendChild(list);
}

async function processAccounts(id) {

    let list = new customList();
    const Account_Endpoint = new REST('/mongodb/accounts');
    let allAccounts = await Account_Endpoint.get();
    let objects = allAccounts.filter(acc => acc.contacts.includes(id));
    list.title = ['account_Name', 'account_Email', 'account_Phone', 'account_Income'];
    list.redirect = '/templates/accounts/viewAccounts.html'
    list.value = objects;
    document.querySelector('#accountSection').appendChild(list);

}

async function processMeetings(contact) {
    const list = new customList();
    list.title = ['meeting_topic', 'meeting_Agenda', 'start_Date']
    const Meeting_Endpoint = new REST('/mongodb/meetings');
    let allMeetings = await Meeting_Endpoint.get();

    let Meeting = allMeetings.filter(item => item.session.participants.some(ele =>
        ele.email == contact.email
    ));
    let arr = []
    Meeting.forEach((element) => {
        element.session['_id'] = element.session.meetingKey;
        arr.push(element.session);
    });

    list.value = arr;
    list.redirect = '/templates/meetings/meetingsDetail.html';
    Sections.meetingsSection().appendChild(list);

}


// Edit redirect 

const editBtn = document.querySelector("#editContact");
editBtn.addEventListener("click", () => {
    window.location.href = `/templates/contacts/editcontact.html?id=${contactID}`;
})


const optionBtn = document.querySelector(".options");
optionBtn.onfocus = () => {
    let menu = document.getElementById("dropDown1");
    menu.style.display = "block";
}
optionBtn.onblur = () => {
    setTimeout(() => {
        let menu = document.getElementById("dropDown1");
        menu.style.display = "none";
    }, 300)
}

// Delete Contact 
const deleteContact = document.querySelector("#deleteBtn");
deleteContact.addEventListener("click", async (e) => {
    let confirmation = confirm("Are you sure? Delete Contact");
    if (confirmation) {
        try {
            let response = await fetch("/mongodb/accounts");
            if (!response.ok) throw new Error(`Error Fetching accounts`);
            let accounts = await response.json()
            await Promise.all(accounts.map(async (account) => {
                if (account.contacts.includes(contactID)) {
                    account.contacts = account.contacts.filter(id => id !== contactID)
                }
                let obj = {}
                obj = Object.assign(obj, account);
                delete obj._id;
                let updateResponse = await fetch("/mongodb/accounts/" + account._id, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(obj)
                })
                if (!updateResponse.ok) {
                    throw new Error(`Error in updating Account ${account.id}: ${updateResponse.statusText}`);

                }
            }));
            let deleteContact = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!deleteContact.ok) throw new Error(`Error is Deleting contact${contactID} : ${deleteContact.statusText}`);
            window.open('/templates/contacts.html', '_self');
        } catch (error) {
            console.error(error);
        }
    }

})

// createMeeting Button
buttonRedirect(buttons.meetingCreateButton(), contactID, '/templates/meetings/createMeetings.html', 'contacts');

// create Deal
buttonRedirect(buttons.createDeal(), contactID, '/templates/deals/createDeal.html', 'contacts');

// send Mail
const sidebar = new rightPopUP();
sidebar.addEventListener('close-true', (e) => {
    declarations.popup().style.display = 'none';
})
declarations.sendMail().addEventListener('click', (e) => {
    e.preventDefault();
    fetch('/templates/email/sendMailTemplate.html')
        .then(response => response.text())
        .then(html => {
            sidebar.content = html;
        })
        .then(() => {
            requestAnimationFrame(() => {
                let input = sidebar.shadowRoot.querySelector('#to-address');
                if (input) {
                    input.value = Contact.email;
                    input.disabled = false;
                    input.readOnly = false;
                }
            });
        })
        .then(() => {
            declarations.popup().style.display = 'flex';
            declarations.popup().replaceChildren(sidebar)
            importFormJs(sidebar);
        })
        .then(() => {
            sidebar.shadowRoot.querySelector('#sendMailBtn').addEventListener('mail-status', (e) => {
                let status = e.detail.status;
                if (status) {
                    sidebar.remove();
                    declarations.popup().style.display = 'none';
                }
            })
        })
})
async function importFormJs(sidebar) {
    import('../../js/email/sendMail.js').then(module => {
        module.main(sidebar, 'contacts', contactID);
    })
}