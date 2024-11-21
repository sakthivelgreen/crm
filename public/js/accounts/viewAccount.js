import { deleteID } from './accountModule.js';
import customList from "/components/custom_listview.js";
import REST from '../rest.js';
import { keyMap } from '../../mappings/keyMap.js';
import { Elements, Sections, buttons, popupElements } from '../declarations.js';
import { buttonRedirect } from "../commonFunctions.js";
import rightPopUp from '../../components/rightPopup.js'

// Getting Id from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let accountID = urlParams.get('id');
let url = "/mongodb/accounts/";
let account_details;

// Targeting html Elements
let container = document.querySelector(".viewAccountDetails");
let orgTable = document.querySelector("#accountTable");

// Back Button
const PreviousPage = document.getElementById("backArrowBtn");
PreviousPage.onclick = () => window.location.href = `/templates/accounts.html`;

// Options Button
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


// Edit redirect 
const editBtn = document.querySelector("#editAccount");
editBtn.addEventListener("click", () => {
    window.location.href = `/templates/accounts/editAccount.html?id=${accountID}`;
})

// View accounts list 
async function getAccounts() {
    try {
        let response = await fetch(url + accountID, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (!response.ok) {
            console.log(response.statusText);
            throw new Error("Error Fetching Accounts");
        }
        let jsonObject = await response.json();
        processAccounts(jsonObject);
    } catch (error) {
        console.log(error)
    }
}

getAccounts()  // Calling Main Function


// Processing accounts View
function processAccounts(account) {
    account_details = account;
    Elements.pageTitle().textContent = keyMap.account_Name(account);
    document.title = `${keyMap.account_Name(account)} (Account) - Zoho CRM`
    const tbody = document.createElement("tbody");
    orgTable.appendChild(tbody);
    const tr1 = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = `Organisation`;
    tr1.appendChild(td);
    tbody.appendChild(tr1);
    for (const key in account) {
        if (key !== "_id" && key !== "contacts") {
            const tr = document.createElement("tr");
            tr.id = account.id;
            const td1 = document.createElement("td");
            td1.textContent = key;
            tr.appendChild(td1)
            const td2 = document.createElement("td");
            td2.textContent = account[key];
            tr.appendChild(td2)
            tbody.appendChild(tr);
        }
    }
    processContactDetails(account.contacts);
    processDeals(account._id);
    processMeetings(account);
}

async function processContactDetails(contactsArray) {
    let list = new customList();
    let objects = await Promise.all(contactsArray.map(id => getContactObject(id)));
    list.title = ['name', 'email', 'phone', 'designation']
    list.value = objects;
    list.redirect = '/templates/contacts/viewContactDetail.html';
    Sections.contactSection().appendChild(list);

}
async function processDeals(id) {
    let list = new customList();
    const Deal_Endpoint = new REST('/mongodb/deals');
    let allDeals = await Deal_Endpoint.get();
    let objects = allDeals.filter(deal => deal.accountID == id);
    list.title = ['deal_Name', 'deal_Pipeline', 'deal_Stage', 'deal_Amount'];
    list.redirect = '/templates/deals/viewDeals.html'
    list.value = objects;
    Sections.dealSection().appendChild(list);
}

async function processMeetings(account) {
    const list = new customList();
    list.title = ['meeting_topic', 'meeting_Agenda', 'start_Date']
    const Meeting_Endpoint = new REST('/mongodb/meetings');
    let allMeetings = await Meeting_Endpoint.get();

    let Meeting = allMeetings.filter(item => item.session.participants.some(ele =>
        ele.email == account.organisation_email
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

// Fetch Contacts Using ID (Function)
async function getContactObject(id) {
    try {
        let response = await fetch("/mongodb/contacts/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (!response.ok) throw new Error("Error in getting Contacts");
        let obj = await response.json();
        return obj;
    } catch (error) {
        console.error('Error fetching contact name:', error);
        return 'Error Fetching Contact'; // Return a default value in case of an error
    }
}


// Delete Account
const deleteBtn = document.querySelector('#deleteBtn');
deleteBtn.addEventListener("click", deleteAccount);

async function deleteAccount(e) {
    e.preventDefault();
    await deleteContact(accountID);
    try {
        let response = await fetch(url + accountID, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (!response.ok) throw new Error("Error in Deleting Account");
        let res = response.json();
        return window.location.href = `/templates/accounts.html`;
    } catch (error) {
        console.log(error);
        return "";
    }
}


async function deleteContact(AccID) {
    let response = await fetch("/mongodb/contacts")
    if (!response.ok) throw new Error(response.statusText);
    let resp = await response.json();
    for (const res of resp) {
        if (res['organisation_id'].includes(AccID)) {
            res['organisation_id'].pop(AccID);
            res['companyname'] = "";
        }
        try {
            let obj = deleteID(res);
            let response = await fetch("/mongodb/contacts/" + res["_id"], {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(obj)
            })
            if (!response.ok) {
                throw new Error(`Error ${response.statusText}`);
            }

        } catch (error) {
            throw new Error(error);

        }
    }
}

// redirect Buttons 
// Create Meeting
buttonRedirect(buttons.meetingCreateButton(), accountID, '/templates/meetings/createMeetings.html', 'accounts')
buttonRedirect(buttons.createDeal(), accountID, '/templates/deals/createDeal.html', 'accounts')

// send Mail
const sidebar = new rightPopUp();
sidebar.addEventListener('close-true', (e) => {
    popupElements.popup().style.display = 'none';
})
buttons.sendMail().addEventListener('click', (e) => {
    fetch('/templates/email/sendMailTemplate.html')
        .then(response => response.text())
        .then(html => {
            sidebar.content = html;
        })
        .then(() => {
            requestAnimationFrame(() => {
                let input = sidebar.shadowRoot.querySelector('#to-address');
                if (input) {
                    input.value = account_details.organisation_email;
                    input.disabled = false;
                    input.readOnly = false;
                }
            });
        })
        .then(() => {
            popupElements.popup().style.display = 'flex';
            popupElements.popup().replaceChildren(sidebar)
            importFormJs(sidebar);
        })
        .then(() => {
            sidebar.shadowRoot.querySelector('#sendMailBtn').addEventListener('mail-status', (e) => {
                let status = e.detail.status;
                if (status) {
                    sidebar.remove();
                    popupElements.popup().style.display = 'none';
                }
            })
        })
})
async function importFormJs(sidebar) {
    import('../../js/email/sendMail.js').then(module => {
        module.main(sidebar, 'accounts', accountID);
    })
}