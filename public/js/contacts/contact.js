const createContactBtn = document.querySelector("#createContactBtn");
createContactBtn.addEventListener("click", () => {
    window.location.href = "/templates/contacts/createContact.html";
})

// setting table head value from object by converting array
let Arr = ["firstname", "lastname", "email", "phone", "companyname", "address", "product", "designation"]

async function fetchContacts() {
    let Contacts = [];
    try {
        // Fetching Contacts from db.json
        const response = await fetch("http://localhost:3000/contacts", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        Contacts = await response.json();
        filterFunction(Contacts);
        processContacts(Contacts);

    } catch (error) {
        alert("Please Check the database connection")
    }
}

fetchContacts(); // Calling the Main function

const contactTable = document.querySelector("#ListTable");
const thead = document.createElement("thead");
const tbody = document.createElement("tbody");
contactTable.appendChild(thead);
contactTable.appendChild(tbody);

async function processContacts(contactsData) {

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
    for (const obj in contactsData) {
        let count = 0;
        let head = Arr.values()
        const tr = document.createElement("tr");
        tbody.appendChild(tr);
        let value = contactsData[obj];
        const checkBoxTd = document.createElement("td");
        tr.appendChild(checkBoxTd);
        for (const contact in value) {
            count++;
            if (count > Arr.length) continue;
            if (!(contact === "id")) {
                const td = document.createElement("td");
                td.className = head.next().value;
                tr.appendChild(td);
                if (td.className === "email") td.innerHTML = `<span id="${value.id}" class="${td.className}Span">${value[td.className]}</span>`;
                else if (td.className === "phone") td.innerHTML = `<span id="${value.id}" class="${td.className}Span">${value[td.className]}</span>`;
                else td.innerHTML = `<span id="${value.id}" class="${td.className}">${value[td.className]}</span>`;
            }
            tr.id = `${value.id}`;
            checkBoxTd.innerHTML = `<input type="checkbox" id=${value.id} class ="checkBox">`;
            checkBoxTd.className = `checkbox`;
            checkBoxTd.addEventListener("click", (e) => {
                e.stopPropagation();
            })

        }
    }

    const inputCheckBox = document.querySelectorAll(".checkBox");
    const inputCheckAll = document.querySelector("#checkAll");
    processCheckBox(inputCheckAll, inputCheckBox);
    const tableSpan = contactTable.querySelectorAll("span");
    const tableRows = contactTable.querySelectorAll("tr");
    viewDetail(tableSpan, tableRows) // Calling Detailed contact view redirect function;
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
            if (clicked === "span") window.location.href = `/templates/contacts/viewContactDetail.html?id=${e.target.id}`;
            else window.location.href = `/templates/contacts/viewContactDetail.html?id=${e.target.parentElement.id}`;
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
    let url = `http://localhost:3000/contact/?id=`;


    // delete button click event listener
    deleteBtn.addEventListener("click", async () => {
        if (checkBoxArray.length) {
            const confirmationMessage = head.checked
                ? "Are you sure you want to delete all records?"
                : "Are you sure you want to delete the record?";
            const confirmDel = confirm(confirmationMessage);

            if (confirmDel) {
                try {
                    await Promise.all(checkBoxArray.map(ele => funDelete(ele)));
                } catch (error) {
                    alert("An error occurred during deletion: " + error.message);
                }
            }
        }
    });
}

async function funDelete(param) {
    try {
        // Fetch all accounts
        let response = await fetch("http://localhost:3000/accounts");
        if (!response.ok) throw new Error(`Error fetching accounts: ${response.statusText}`);
        let accounts = await response.json();

        // Update accounts
        await Promise.all(accounts.map(async (account) => {
            if (account.contacts.includes(param)) {
                account.contacts = account.contacts.filter(id => id !== param);

                let updateResponse = await fetch(`http://localhost:3000/accounts/${account.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(account)
                });

                if (!updateResponse.ok) throw new Error(`Error updating account ${account.id}: ${updateResponse.statusText}`);
            }
        }));

        // Delete the contact
        let delFetch = await fetch(`http://localhost:3000/contacts/${param}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (!delFetch.ok) throw new Error(`Error deleting contact: ${delFetch.statusText}`);

        console.log("Delete Success");

    } catch (error) {
        console.error("Error in deletion:", error);
        throw error;
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


let searchObj = [];
const selectElement = document.querySelector("#filterSelect");
const searcInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#SearchBtn");


function filterFunction(contacts) {
    Arr.forEach(ele => {
        const option = document.createElement("option");
        option.value = ele;
        option.textContent = ele.toUpperCase()
        selectElement.appendChild(option)
    })

    selectElement.addEventListener("change", () => {
        if (searcInput.value !== "") {
            searchBtn.style.display = "block";
        }
        searcInput.value = "";
        searchObj = []
        processContacts(contacts)
    })

    searcInput.addEventListener("keyup", () => {
        searchObj = []
        if (searcInput.value !== "" && selectElement.value !== "") {
            let searchKey = searcInput.value;
            let key = selectElement.value;

            contacts.forEach(lead => {
                let val = lead[key].toLowerCase();
                searchKey = searchKey.toLowerCase();
                if (val.includes(searchKey)) {
                    searchObj.push(lead);
                }
            })
            processContacts(searchObj)
            // searchBtn.style.display = "block";
        } else {
            searchObj = []
            processContacts(contacts)
        }
    })




}