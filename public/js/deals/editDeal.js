import { back, getParams, dateFormat, dateOptions } from '../commonFunctions.js';
import { declarations } from './dealDeclarations.js';
import REST from '../rest.js';
import { API_Endpoint, getDeal, Pipeline_Endpoint } from './dealModule.js';

// back or cancel
back(declarations.cancelBtn())

// Get id
let dealID = getParams(window.location.search).id;


let Contacts_Endpoint = new REST("/mongodb/contacts");
let Accounts_Endpoint = new REST("/mongodb/accounts");

let updateObject = {
    accountID: "",
    contactID: "",
    dealaccount: "",
    dealamount: "",
    dealclosingdate: "",
    dealcontact: "",
    dealname: "",
    dealowner: "",
    dealpipeline: "",
    dealstage: ""
}
async function main() {
    let obj = await getDeal(dealID);
    console.log(obj);
    await setValues(obj);
}

main();

async function setValues(obj) {
    let accounts = await Accounts_Endpoint.get();
    let contacts = await Contacts_Endpoint.get();

    document.title = `Edit Deal ( ${obj.dealname} ) - Zoho CRM`;
    declarations.dealName().value = obj.dealname;
    declarations.dealOwner().value = obj.dealowner;
    declarations.dealAmount().value = obj.dealamount;
    declarations.dealClosingDate().value = dateFormat(new Date(obj.dealclosingdate), dateOptions);

    setPipelines(obj);
    setDate();
    setContacts(obj, contacts);
    setAccounts(obj, accounts);
    events(contacts, accounts, obj);
}

function setDate() {
    flatpickr("#dealClosingDate", {
        dateFormat: "M d, Y",
        minDate: "today",
    })
}

async function setPipelines(deal) {
    let obj = await Pipeline_Endpoint.get();
    obj.forEach(data => {
        for (const pipeline in data) {
            if (pipeline === "_id") {
                continue
            }
            const option = document.createElement('option');
            option.value = pipeline;
            option.textContent = pipeline.charAt(0).toUpperCase() + pipeline.slice(1);
            declarations.dealPipeline().appendChild(option);
            if (pipeline === deal.dealpipeline) {
                for (const element in data[pipeline]) {
                    const stage = document.createElement("option");
                    stage.value = element;
                    stage.textContent = element.charAt(0).toUpperCase() + element.slice(1);
                    if (element === deal.dealstage) stage.selected = 'true';
                    declarations.dealStage().appendChild(stage);
                }
                option.selected = "true";
            }
        }
        declarations.dealPipeline().addEventListener("change", () => {
            let option = declarations.dealPipeline().value;
            for (const key in data) {
                if (key === option) {
                    while (declarations.dealStage().hasChildNodes()) declarations.dealStage().removeChild(declarations.dealStage().firstChild)
                    for (const element in data[key]) {
                        const stage = document.createElement("option");
                        stage.value = element;
                        stage.textContent = element.charAt(0).toUpperCase() + element.slice(1);
                        declarations.dealStage().appendChild(stage);
                    }
                }
            }
        })
    })
}

async function setContacts(deal, contacts) {
    let optionDefault = document.createElement('option');
    optionDefault.textContent = 'Select Contact';
    optionDefault.value = "";
    optionDefault.selected = true;
    optionDefault.disabled = true;
    declarations.contactName().appendChild(optionDefault);
    contacts.forEach(contact => {
        contactName = document.createElement('option');
        contactName.value = contact._id;
        contactName.textContent = `${contact.firstname} ${contact.lastname}`;
        contactName.id = contact._id;
        if (contact._id === deal.contactID) {
            contactName.selected = 'true';
            updateObject.contactID = contact._id;
        }
        declarations.contactName().appendChild(contactName);
    })

}
async function setAccounts(deal, accounts) {
    let optionDefault = document.createElement('option');
    optionDefault.textContent = 'Select Account';
    optionDefault.value = "";
    optionDefault.selected = true;
    declarations.accountName().appendChild(optionDefault);
    accounts.forEach(account => {
        accountName = document.createElement('option');
        accountName.value = account._id;
        accountName.textContent = account.organisation_name;
        accountName.id = account._id;
        if (account._id === deal.accountID) {
            accountName.selected = 'true';
            updateObject.accountID = account._id;
        }
        declarations.accountName().appendChild(accountName);
    })
}

function events(contacts, accounts, obj) {
    let id;
    let buttonsRow = document.querySelector('.topRow2');
    buttonsRow.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.id === 'saveDealBtn') {
            let res = await updateDeal();
            if (res) window.open('/templates/deals.html', '_self');
        }
        if (e.target.id === 'btnSaveAndNew') {
            let res = await updateDeal()
            if (res) window.open('/templates/deals/createDeal.html', '_self');
        }
    })

    declarations.accountName().addEventListener('change', (e) => {
        e.preventDefault();
        updateObject.accountID = "";
        id = e.target.value;
        if (id) {
            updateObject.accountID = id;
            let obj = accounts.filter(account => account._id === id);
            updateObject.dealaccount = `${obj[0].organisation_name}`;
        }
    })
    declarations.contactName().addEventListener('change', (e) => {
        e.preventDefault();
        id = e.target.value;
        updateObject.contactID = id;
        let obj = contacts.filter(contact => contact._id === id);
        updateObject.dealcontact = `${obj[0].firstname} ${obj[0].lastname}`;
    })

}
async function updateDeal() {
    updateObject.dealname = declarations.dealName().value;
    updateObject.dealowner = declarations.dealOwner().value;
    updateObject.dealpipeline = declarations.dealPipeline().value;
    updateObject.dealstage = declarations.dealStage().value;
    updateObject.dealamount = declarations.dealAmount().value;
    updateObject.dealclosingdate = declarations.dealClosingDate().value;
    try {
        let response = await API_Endpoint.put(dealID, updateObject)
        console.log(response);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}