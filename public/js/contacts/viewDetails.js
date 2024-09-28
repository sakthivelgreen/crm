const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let contactID = urlParams.get('id');
let isRunning = false;


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
        if (response.status === 404 && isRunning === true) {
            alert("Delete Success")
            window.location.href = `/templates/contacts.html`
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        contacts = await response.json();
        getLeads(contacts);
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
function getLeads(contact) {
    titleElement.textContent = `${contact.firstname} ${contact.lastname}`;
    for (const key in contact) {
        if (key === "id") continue;
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        td1.textContent = key;
        td2.textContent = contact[key];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
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
                let updateResponse = await fetch("/mongodb/accounts/" + account.id, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(account)
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

        } catch (error) {
            console.error(error);
        }
    }

})

