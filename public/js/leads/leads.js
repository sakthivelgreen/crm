// create a lead (redirects to lead creation page)
const createLeadBtn = document.querySelector("#createLeadBtn");
createLeadBtn.addEventListener("click", () => {
    window.location.href = '/templates/leads/createleads.html';
})

// setting table head value from object by converting array
let Arr = ["firstname", "lastname", "email", "phone", "companyname", "address", "product", "designation"]

// function for retrieving leads

async function fetchLeads() {
    let leads = [];
    try {
        // Fetching leads from db.json
        const response = await fetch("/mongodb/leads", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        leads = await response.json();
        filterFunction(leads);
        processLeads(leads);

    } catch (error) {
        alert("Please Check the database connection")
    }
}

fetchLeads(); // Calling the Main function

// creating a table to display leads information

const leadTable = document.querySelector("#ListTable");
const thead = document.createElement("thead");
const tbody = document.createElement("tbody");
leadTable.appendChild(thead);
leadTable.appendChild(tbody);

// table manipulations

async function processLeads(leads) {

    leadsData = leads;
    while (tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild)
    }
    while (thead.hasChildNodes()) {
        thead.removeChild(thead.firstChild)
    }
    const checkAll = document.createElement("th");
    thead.appendChild(checkAll);

    checkAll.innerHTML = `<input type="checkbox" id="checkAll">`;

    // Looping to create table head
    Arr.forEach(ele => {
        if (!(ele === "_id")) {
            const th = document.createElement("th");
            th.className = ele;
            th.textContent = ele.toUpperCase();
            thead.appendChild(th)
        }
    });

    // for table body
    for (const key in leadsData) {
        let count = 0;
        let head = Arr.values()
        const tr = document.createElement("tr"); // creating rows
        tbody.appendChild(tr);
        let value = leadsData[key];
        const checkBoxTd = document.createElement("td"); // td for inserting checkbox
        tr.appendChild(checkBoxTd);

        // Table td for each row created above
        for (const lead in value) {
            count++;
            if (count > Arr.length) continue;
            if (!(lead === "_id")) {
                const td = document.createElement("td"); // creating td element
                td.className = head.next().value;        // setting class name for correctly display data
                tr.appendChild(td);                      // appendig to table row

                if (td.className === "email") {
                    // setting to open email based on class name
                    td.innerHTML = `<span id="${value._id}" class="${td.className}Span">${value[td.className]}</span>`;
                }
                else if (td.className === "phone") {
                    // setting to open phone based on class name
                    td.innerHTML = `<span id="${value._id}" class="${td.className}Span">${value[td.className]}</span>`;
                }
                else {
                    td.innerHTML = `<span id="${value._id}" class="${td.className}">${value[td.className]}</span>`;
                }
            }
            tr.id = `${value._id}`;
            checkBoxTd.innerHTML = `<input type="checkbox" id=${value._id} class="checkBox">`;
            checkBoxTd.className = `checkbox`;
            checkBoxTd.addEventListener("click", (e) => {
                e.stopPropagation();  // to stop event bubble
            })

        }
    }

    const inputCheckBox = document.querySelectorAll(".checkBox");
    const inputCheckAll = document.querySelector("#checkAll");

    processCheckBox(inputCheckAll, inputCheckBox);  // Checkbox function

    const tableSpan = leadTable.querySelectorAll("span");
    const tableRows = leadTable.querySelectorAll("tr");

    viewDetail(tableSpan, tableRows) // Calling Detailed lead view redirect function;
}


function viewDetail(allSpan, trElement) {
    let trArray = Array.from(trElement);
    let spanArray = Array.from(allSpan);
    let clicked = "span";

    // leadclick funtion definition for correct redirection of page
    function leadClick(e) {
        e.stopPropagation();
        if (e.target.className === "emailSpan") {
            window.location.href = `mailto:${e.target.textContent}`;
        } else if (e.target.className === "phoneSpan") {
            window.location.href = `tel:${e.target.textContent}`;
        } else {
            if (clicked === "span") window.location.href = `/templates/leads/viewleadDetail.html?id=${e.target.id}`;
            else window.location.href = `/templates/leads/viewleadDetail.html?id=${e.target.parentElement.id}`;
        }

    }


    // setting redirect function while clicking the text
    spanArray.forEach(ele => ele.addEventListener("click", (e) => {
        clicked = "span";
        leadClick(e);
    }));

    // setting redirect function while clicking row
    trArray.forEach(ele => ele.addEventListener("click", (e) => {
        clicked = "row";
        leadClick(e);
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
                leadoptions()               // updating options while items in checkbox array
            } else {                                // unchecked condition
                // checkBoxArray.pop(e.target.id);
                checkBoxArray = checkBoxArray.filter(ele => ele !== e.target.id)
                console.log(checkBoxArray);
                allcheck()
                leadoptions()               // updating options while items in checkbox
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
        leadoptions()                           // options updation
    })


    // function definiton for leadoptions()
    function leadoptions() {
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
    let url = `http://localhost:3000/lead/?id=`;


    // delete button click event listener
    deleteBtn.addEventListener("click", () => {
        if (checkBoxArray.length) {
            if (head.checked) confirmDel = confirm("Are you Sure to delete all records");  // getting confirmation
            else confirmDel = confirm("Are you Sure to delete the record");                // getting confirmation
            if (confirmDel) {
                checkBoxArray.forEach(ele => {
                    funDelete(ele)      // calling delete function to delete lead
                });

            }

        }
    })
}


// delete function definition
async function funDelete(param) {
    try {
        let delFetch = await fetch(`http://localhost:3000/leads/${param}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
        delFetch.then(console.log("Delete Success"))
    } catch (error) {
        alert("Error in deletion " + error)
        throw new Error("error", error);
    }
    finally {
        alert("Delete Success")
    }

}


// filter Function
let searchObj = [];
const selectElement = document.querySelector("#filterSelect");
const searcInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#SearchBtn");


function filterFunction(leads) {
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
        processLeads(leads)
    })

    searcInput.addEventListener("keyup", () => {
        searchObj = []
        if (searcInput.value !== "" && selectElement.value !== "") {
            let searchKey = searcInput.value;
            let key = selectElement.value;

            leads.forEach(lead => {
                let val = lead[key].toLowerCase();
                searchKey = searchKey.toLowerCase();
                if (val.includes(searchKey)) {
                    searchObj.push(lead);
                }
            })
            processLeads(searchObj)
            // searchBtn.style.display = "block";
        } else {
            searchObj = []
            processLeads(leads)
        }
    })




}
