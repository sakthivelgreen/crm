// setting table head value from object by converting array
let Arr = ["organisation_name", "contacts"]

async function fetchAccounts() {
    let Accounts = [];
    try {
        // Fetching Contacts from db.json
        const response = await fetch("/mongodb/accounts", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        Accounts = await response.json();
        await filterFunction(Accounts);
        processAccounts(Accounts);

    } catch (error) {
        alert("Please Check the database connection")
    }
}

fetchAccounts(); // Calling the Main function

const contactTable = document.querySelector("#ListTable");
const thead = document.createElement("thead");
const tbody = document.createElement("tbody");
contactTable.appendChild(thead);
contactTable.appendChild(tbody);

async function processAccounts(accountsData) {

    while (tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild)
    }
    while (thead.hasChildNodes()) {
        thead.removeChild(thead.firstChild)
    }

    const checkAll = document.createElement("th");
    thead.appendChild(checkAll);
    checkAll.innerHTML = `<input type="checkbox" id="checkAll">`;
    Arr.forEach(ele => {
        if (!(ele === "id")) {
            const th = document.createElement("th");
            th.className = ele;
            th.textContent = ele.toUpperCase();
            thead.appendChild(th)
        }
    });
    for (const obj in accountsData) {
        let head = Arr.values()
        // console.log(head);

        const tr = document.createElement("tr");
        tbody.appendChild(tr);
        let value = accountsData[obj];
        const checkBoxTd = document.createElement("td");
        tr.appendChild(checkBoxTd);
        tr.id = value.id;
        for (const account in Arr) {
            if (!(Arr[account] === "contacts")) {
                const td = document.createElement("td");
                td.className = head.next().value;
                tr.appendChild(td);
                if (td.className === "email") td.innerHTML = `<span id="${value.id}" class="${td.className}Span">${value[td.className]}</span>`;
                else if (td.className === "phone") td.innerHTML = `<span id="${value.id}" class="${td.className}Span">${value[td.className]}</span>`;
                else td.innerHTML = `<span id="${value.id}" class="${td.className}">${value[td.className]}</span>`;
                checkBoxTd.innerHTML = `<input type="checkbox" id=${value["id"]} class ="checkBox">`;
                checkBoxTd.className = `checkbox`;
                checkBoxTd.addEventListener("click", (e) => {
                    e.stopPropagation();
                })
            } else if (Arr[account] === "contacts") {
                const arrid = value.contacts;
                const names = await Promise.all(arrid.map(id => getContactName(id)));
                const nameString = names.join(' ,');
                const td = document.createElement("td");
                td.className = "contacts";
                td.textContent = nameString;
                tr.appendChild(td);
            }
        }
    }

    async function getContactName(id) {
        try {
            let response = await fetch(`/mongodb/contacts/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            let data = await response.json();
            return `${data.firstname} ${data.lastname}`; // Assuming the API returns an object with a `name` property
        } catch (error) {
            console.error('Error fetching contact name:', error);
            return 'Unknown'; // Return a default value in case of an error
        }
    }

    const inputCheckBox = document.querySelectorAll(".checkBox");
    const inputCheckAll = document.querySelector("#checkAll");
    processCheckBox(inputCheckAll, inputCheckBox);
    const tableSpan = contactTable.querySelectorAll("span");
    const tableRows = contactTable.querySelectorAll("tr");
    viewDetail(tableSpan, tableRows) // Calling Detailed accounts view redirect function;
}


function viewDetail(allSpan, trElement) {
    let trArray = Array.from(trElement);
    let spanArray = Array.from(allSpan);
    let clicked = "span";
    function contactClick(e) {
        e.stopPropagation();
        if (e.target.className === "emailSpan") {
            window.location.href = `mailto:${e.target.textContent}`;
        } else if (e.target.className === "phoneSpan") {
            window.location.href = `tel:${e.target.textContent}`;
        } else {
            if (clicked === "span") window.location.href = `/templates/accounts/viewAccounts.html?id=${e.target.id}`;
            else window.location.href = `/templates/accounts/viewAccounts.html?id=${e.target.parentElement.id}`;
        }

    }

    spanArray.forEach(ele => ele.addEventListener("click", (e) => {
        clicked = "span";
        contactClick(e);
    }));
    trArray.forEach(ele => ele.addEventListener("click", (e) => {
        clicked = "row";
        contactClick(e);
    }));
}

// checkbox function definition
function processCheckBox(head, body) {
    let checkBoxArray = [];             // creating an array store selected items
    let bodyCheck = Array.from(body);   // getting all checkbox from table body

    bodyCheck.forEach(element => {      // setting event listener for all checkbox in table body
        element.addEventListener("click", (e) => {
            e.stopPropagation();
            if (e.target.checked == true) {         // checked conditon
                checkBoxArray.push(e.target.id);
                console.log(checkBoxArray);
                allcheck()
                contactOptions()               // updating options while items in checkbox array
            } else {                                // unchecked condition
                // checkBoxArray.pop(e.target.id);
                checkBoxArray = checkBoxArray.filter(ele => ele !== e.target.id)
                console.log(checkBoxArray);
                allcheck()
                contactOptions()               // updating options while items in checkbox
            }
        })
    });


    // funtion to check if all items are checked
    function allcheck() {
        for (let i = 0; i < bodyCheck.length; i++) {
            if (!bodyCheck[i].checked) {
                head.checked = false;
                return
            }
        }
        head.checked = true;
    }

    // fuction for checkbox in table head 
    head.addEventListener("change", (e) => {
        if (head.checked) {                     // if checked(true)
            bodyCheck.forEach(e => {
                e.checked = true;
                checkBoxArray.push(e.id);
            })
        }
        else {
            bodyCheck.forEach(e => {            // if checked(false)
                e.checked = false;
                checkBoxArray.pop(e.id);
            })
        }
        contactOptions()                           // options updation
    })


    // function definiton for contactOptions()
    function contactOptions() {
        if (checkBoxArray.length !== 0) {
            optionRow.style.display = "flex";
            row1.style.display = "none";
            row2.style.display = "none";
        } else {
            optionRow.style.display = "none";
            row1.style.display = "flex";
            row2.style.display = "flex";
        }
    }

    const row1 = document.querySelector(".topRow1");
    const row2 = document.querySelector(".topRow2");
    const optionRow = document.querySelector(".optionsRow"); // targeting delete button list-item
    const deleteBtn = document.querySelector("#deleteBtn"); // targetting delete button 

    let confirmDel;         // variable to get confirmation from user


    // delete button click event listener
    deleteBtn.addEventListener("click", async () => {
        if (checkBoxArray.length) {
            const message = head.checked ?
                "Are you sure you want to delete all records?" :
                "Are you sure you want to delete the record?";

            const confirmDel = confirm(message);
            if (confirmDel) {
                try {
                    await Promise.all(checkBoxArray.map(ele => funDelete(ele)));
                    alert("Delete Success");
                } catch (error) {
                    alert("Error in deletion: " + error.message);
                }
            }
        }
    });
}

async function funDelete(param) {
    try {
        // Fetch all contacts
        let response = await fetch("/mongodb/contacts");
        if (!response.ok) throw new Error(response.statusText);
        let contacts = await response.json();

        // Update each contact
        await Promise.all(contacts.map(async (contact) => {
            if (contact['organisation_id'].includes(param)) {
                contact['organisation_id'] = contact['organisation_id'].filter(id => id !== param);
                contact['companyname'] = "";

                let updateResponse = await fetch(`/mongodb/contacts/${contact["id"]}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(contact)
                });
                if (!updateResponse.ok) throw new Error(`Error updating contact ${contact["id"]}: ${updateResponse.statusText}`);
            }
        }));

        // Delete the account
        let delFetch = await fetch(`/mongodb/accounts/${param}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        if (!delFetch.ok) throw new Error(`Error deleting account ${param}: ${delFetch.statusText}`);

    } catch (error) {
        throw new Error(error.message);
    }
}

const optionRow = document.querySelector(".optionsRow");
function contactOptions() {
    if (checkBoxArray.length !== 0) {
        optionRow.style.display = "flex";
        row1.style.display = "none";
        row2.style.display = "none";
    } else {
        optionRow.style.display = "none";
        row1.style.display = "flex";
        row2.style.display = "flex";
    }
}


// New Account Creation

const newAccountBtn = document.getElementById("createAccountBtn");
newAccountBtn.onclick = () => window.location.href = "/templates/accounts/createAccount.html";


// filter Function
let searchObj = [];
const selectElement = document.querySelector("#filterSelect");
const searcInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#SearchBtn");


async function filterFunction(leads) {
    Arr.forEach(ele => {
        const option = document.createElement("option");
        option.value = ele;
        option.textContent = ele.toUpperCase()
        selectElement.appendChild(option)
    })

    selectElement.addEventListener("change", () => {
        searcInput.value = "";
        searchObj = []
        processAccounts(leads)
    })

    searcInput.addEventListener("keyup", () => {
        searchObj = []
        if (searcInput.value !== "" && selectElement.value !== "") {
            let searchKey = searcInput.value;
            let key = selectElement.value;

            if (selectElement.value === "contacts") {
                getContactid(searchKey).then(result => {
                    leads.forEach(lead => {
                        result.forEach(res => {
                            if (lead["contacts"].includes(res)) {
                                searchObj.push(lead);
                            }
                        })

                    })
                    processAccounts(searchObj);
                })

            } else {
                leads.forEach(lead => {
                    let val = lead[key].toLowerCase();
                    searchKey = searchKey.toLowerCase();
                    if (val.includes(searchKey)) {
                        searchObj.push(lead);
                    }
                })
            }

            processAccounts(searchObj)
            // searchBtn.style.display = "block";
        } else {
            searchObj = []
            processAccounts(leads)
        }
    })
}
async function getContactid(keys) {
    keys = keys.toLowerCase();
    let arr = [];
    try {
        let response = await fetch("/mongodb/contacts/")
        if (!response.ok) {
            throw new Error("Error Fetching Contacts");
        }
        let resp = await response.json();
        for (const res of resp) {
            if ((res["firstname"].toLowerCase()).includes(keys) || (res["lastname"].toLowerCase()).includes(keys)) {
                arr.push(res.id)
            }
        }
        return arr;
    } catch (error) {

    }
}