import { deleteID } from './accountModule.js'

// Getting Id from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let accountID = urlParams.get('id');
let url = "/mongodb/accounts/";


// Targetting html Elements
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
        let jsonString = await response.json();
        processAccounts(jsonString);
    } catch (error) {

    }
}

getAccounts()  // Calling Main Function


// Processing accounts View
function processAccounts(account) {
    const tbody = document.createElement("tbody");
    orgTable.appendChild(tbody);
    const tr1 = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = `Organisation`;
    tr1.appendChild(td);
    tbody.appendChild(tr1);
    for (const key in account) {
        if (key !== "id" && key !== "contacts") {
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
    processContactDetails(account.contacts)
}

async function processContactDetails(contactsArray) {

    let contactDisplayArr = ['Name', 'Email', 'Phone', 'Designation']
    let head = contactDisplayArr.values();
    const section = document.createElement("section");
    section.id = "contactSection";
    section.className = "details"
    container.appendChild(section);

    const table = document.createElement("table");
    table.className = "accounttables"
    table.id = "contactTable";
    section.appendChild(table)
    const thead = document.createElement("thead");
    table.appendChild(thead);
    const tbody = document.createElement("tbody")
    table.appendChild(tbody);

    let count = 1;
    let objects = await Promise.all(contactsArray.map(id => getContactObject(id)))

    const tr1 = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = `Contacts`;
    td.id = `contactCount`;
    tr1.appendChild(td);
    thead.appendChild(tr1);
    const tr2 = document.createElement("tr");
    thead.appendChild(tr2);
    const Sno = document.createElement("th");
    tr2.appendChild(Sno);
    Sno.textContent = `No`;
    contactDisplayArr.forEach(e => {
        const th = document.createElement("th");
        th.textContent = e;
        th.className = e;
        tr2.appendChild(th);
    })
    objects.forEach(obj => {
        const tr = document.createElement("tr");
        tr.id = obj.id;
        tbody.appendChild(tr)
        const sno = document.createElement("td");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        const td3 = document.createElement("td");
        const td4 = document.createElement("td");
        tr.appendChild(sno);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        sno.textContent = count;
        count++;
        contactDisplayArr.forEach(element => {

            switch (element) {
                case "Name":
                    td1.textContent = `${obj["firstname"]} ${obj["lastname"]}`;
                    break;
                case "Phone":
                    td2.textContent = `${obj["phone"]}`;
                    break;
                case "Email":
                    td3.textContent = `${obj["email"]}`;
                    break;
                case "Designation":
                    td4.textContent = `${obj["designation"]}`;
                    break;

                default:
                    break;
            }
        });
    })
    setRedirect()

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


// setting Contact redirect
function setRedirect() {
    const contactTable = document.querySelector("#contactTable");
    const tbody = contactTable.querySelector("tbody");
    const tr = tbody.querySelectorAll("tr");
    let trArray = Array.from(tr);
    trArray.forEach(e => {
        e.addEventListener("click", () => {
            window.location.href = `/templates/contacts/viewContactDetail.html?id=${e.id}`;

        })
    })
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