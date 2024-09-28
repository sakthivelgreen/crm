import REST from "/js/rest.js";

// FlatPickr library used for custom date picker
document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#closingDate", {
        dateFormat: "M d, Y",
        minDate: "today",
    });
});
// function for date into YYYY-MM-DD format
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// declarations

let contacts = new REST("/mongodb/contacts");
let accounts = new REST("/mongodb/accounts");

const dateInput = document.querySelector("#closingDate");
const cancelBtn = document.querySelector("#cancelBtn");
const saveBtn = document.querySelector("#saveDealBtn");
const saveAndNew = document.querySelector("#btnSaveAndNew");
const dealNameInput = document.querySelector("#dealName");
const dealOwnerInput = document.querySelector("#dealOwner");
const amountInput = document.querySelector('#amount');
const contactPersonInput = document.querySelector('#contactPerson');
const accountInput = document.querySelector('#account');
const pipelineSelect = document.querySelector("#pipeline")
const stageSelect = document.querySelector("#stage");
const popup = document.querySelector("#popUp");
const accountListDiv = document.querySelector(".accountListDiv");
const contactListDiv = document.querySelector(".contactListDiv");
const accountsUL = document.querySelector("#accountsUL");
const contactsUL = document.querySelector("#contactsUL");

// Cancel Button
cancelBtn.addEventListener("click", () => window.location.href = `/templates/deals.html`)

// Getting Pipelines
let piplines = new REST("/mongodb/pipelines");
piplines.get().then((obj) => {
    obj.forEach(data => {
        for (const pipeline in data) {
            if (pipeline === "id") {
                continue
            }
            const option = document.createElement('option');
            option.value = pipeline;
            option.textContent = pipeline.charAt(0).toUpperCase() + pipeline.slice(1);
            pipelineSelect.appendChild(option);
            if (pipeline === "standard") {
                for (const element in data[pipeline]) {
                    const stage = document.createElement("option");
                    stage.value = element;
                    stage.textContent = element.charAt(0).toUpperCase() + element.slice(1);
                    stageSelect.appendChild(stage);
                }
                option.selected = "true";
            }
        }
        pipelineSelect.addEventListener("change", () => {
            let option = pipelineSelect.value;
            for (const key in data) {
                if (key === option) {
                    while (stageSelect.hasChildNodes()) stageSelect.removeChild(stageSelect.firstChild)
                    for (const element in data[key]) {
                        const stage = document.createElement("option");
                        stage.value = element;
                        stage.textContent = element.charAt(0).toUpperCase() + element.slice(1);
                        stageSelect.appendChild(stage);
                    }
                }
            }
        })
    })



})
let saveAndNew_clicked = false;
saveBtn.addEventListener("click", createDeal)
saveAndNew.addEventListener("click", (e) => {
    saveAndNew_clicked = true;
    createDeal(e);
})
let date;
let dealName;
let dealOwner;
let dealAmount;
let dealPipeline;
let dealStage;
let dealContact;
let dealAccount;
let contactId;
let accountId;
function createDeal(e) {
    e.preventDefault();
    date = new Date(dateInput.value);
    date = formatDate(date);
    dealName = dealNameInput.value;
    dealOwner = dealOwnerInput.value;
    dealAmount = amountInput.value;
    dealPipeline = pipelineSelect.value;
    dealStage = stageSelect.value;
    dealContact = contactPersonInput.value;
    dealAccount = accountInput.value;

    let dealObj = {
        dealname: dealName,
        dealowner: dealOwner,
        dealamount: dealAmount,
        dealpipeline: dealPipeline,
        dealstage: dealStage,
        dealcontact: dealContact,
        dealaccount: dealAccount,
        dealclosingdate: date,
        contactID: contactId || "",
        accountID: accountId || ""
    }
    let result = new REST("/mongodb/deals");
    if (dealName && dealAmount && dealContact && date !== "") {
        result.post(dealObj).then(() => {
            const message = document.createElement("span");
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "Close"
            message.textContent = `Deal Created Successfully`;
            popup.appendChild(message);
            popup.appendChild(closeBtn);
            popup.showModal();
            closeBtn.addEventListener("click", () => {
                popup.close();
                saveAndNew_clicked ? window.location.href = `/templates/deals/createDeal.html` : window.location.href = `/templates/deals.html`;
            });
        })
    } else {
        alert("Fill the required Fields");
    }

}


// Getting Account Name and Contact Name

document.addEventListener("DOMContentLoaded", () => {
    // Account
    let contactsArray;
    let accountsArray;
    accounts.get().then((obj) => {
        accountsArray = obj;
        obj.forEach(account => {
            listAccount(account);
        })
    })

    function listAccount(account) {
        if (account === null) {
            const li = document.createElement("li");
            li.textContent = `No Accounts Found`;
            accountsUL.appendChild(li);
            return;
        }
        const li = document.createElement("li");
        li.textContent = account.organisation_name;
        accountsUL.appendChild(li);
        li.addEventListener("click", (e) => {
            accountInput.value = account.organisation_name;
            accountId = account.id;
            updateContact(contactsArray);
        })
    }

    // Contact
    contacts.get().then((obj) => {
        contactsArray = obj;
        while (contactsUL.hasChildNodes()) contactsUL.removeChild(contactsUL.firstChild)
        obj.forEach(contact => {
            listContact(contact);
        })
    })

    function listContact(contact) {
        if (contact === null) {
            const li = document.createElement("li");
            li.textContent = `No Contacts Found`;
            contactsUL.appendChild(li);
            return;
        }
        let name = `${contact.firstname} ${contact.lastname}`
        const li = document.createElement("li");
        li.textContent = name;
        contactsUL.appendChild(li);
        li.addEventListener("click", () => {
            contactPersonInput.value = name;
            contactId = contact.id;
            updateAccount(accountsArray)
        })
    }

    function updateContact(contactsArray) {
        while (contactsUL.hasChildNodes()) contactsUL.removeChild(contactsUL.firstChild)
        if (accountId !== null && accountId !== undefined) {
            let newContactsArray = contactsArray.filter(contact => contact["organisation_id"].includes(accountId));
            newContactsArray.forEach((contact) => {
                listContact(contact)
            })
        } else {
            contactsArray.forEach((contact) => {
                listContact(contact);
            })
        }
    }
    function updateAccount(accountsArray) {
        while (accountsUL.hasChildNodes()) accountsUL.removeChild(accountsUL.firstChild)
        if (contactId !== null && contactId !== undefined) {
            let newAcountsArray = accountsArray.filter(account => account["contacts"].includes(contactId));
            if (newAcountsArray.length > 0) {
                newAcountsArray.forEach((account) => {
                    listAccount(account);
                })
            }
            else {
                listAccount(null);
            }
        } else {
            accountsArray.forEach((account) => {
                listAccount(account);
            })
        }
    }


    // Event Listeners
    accountInput.addEventListener("focus", () => accountListDiv.style.display = "block");
    accountInput.addEventListener("blur", () => {
        setTimeout(() => {
            accountListDiv.style.display = "none";
        }, 200);
    });

    contactPersonInput.addEventListener("focus", () => contactListDiv.style.display = "block");
    contactPersonInput.addEventListener("blur", () => {
        setTimeout(() => {
            contactListDiv.style.display = "none";
        }, 200);
    });

    // Filter 
    accountInput.addEventListener("keyup", () => {
        accountId = null;
        contactId = null;
        updateContact(contactsArray);
        const inputValue = accountInput.value.toLowerCase();
        const filteredAccounts = accountsArray.filter(account =>
            account.organisation_name.toLowerCase().includes(inputValue)
        );
        // Update the UI with filtered accounts
        updateAccountList(filteredAccounts);
    })
    contactPersonInput.addEventListener("keyup", () => {
        accountId = null;
        contactId = null;
        accountInput.value = "";
        updateAccount(accountsArray);
        // Filter contacts based on the input value
        const inputValue = contactPersonInput.value.toLowerCase();
        const filteredContacts = contactsArray.filter(contact =>
            `${contact.firstname} ${contact.lastname}`.toLowerCase().includes(inputValue)
        );
        // Update the UI with filtered contacts
        updateContactList(filteredContacts);
    })

    function updateAccountList(filteredAccounts) {
        while (accountsUL.hasChildNodes()) accountsUL.removeChild(accountsUL.firstChild);
        if (filteredAccounts.length > 0) {
            filteredAccounts.forEach(account => {
                listAccount(account);
            });
        } else {
            listAccount(null); // Optionally handle case with no results
        }
    }

    // Function to update contact list
    function updateContactList(filteredContacts) {
        while (contactsUL.hasChildNodes()) contactsUL.removeChild(contactsUL.firstChild);
        if (filteredContacts.length > 0) {
            filteredContacts.forEach(contact => {
                listContact(contact);
            });
        } else {
            listContact(null); // Optionally handle case with no results
        }
    }

})

