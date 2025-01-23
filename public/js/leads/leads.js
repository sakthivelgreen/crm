import { ContactMap, DealMap, LeadMap, OrgMap } from "../../mappings/keyMap.js";
import { Delete_Record, getData, table_fragment, option_fragment_array } from "../commonFunctions.js";
import { buttons, Elements } from '../declarations.js';
// create a lead (redirects to lead creation page)
const createLeadBtn = document.querySelector("#createLeadBtn");
const Table = document.querySelector("#ListTable");

// setting table head value from object by converting array
const table_headers = ["First Name", "Last Name", "Email", "Phone", "Organization", "Date Created"]
let Leads;
async function main() {
    Leads = await getData('leads');
    Table.appendChild(table_fragment(table_headers, Leads))
    events();
    filterFunction();
}
main();

function events() {
    createLeadBtn.addEventListener("click", () => {
        window.location.href = '/templates/leads/createleads.html';
    })
    CheckBox();
    // delete button click event listener
    buttons.deleteBtn().addEventListener("click", async () => {
        checkBoxArray = [...new Set(checkBoxArray)];
        if (checkBoxArray.length) {

            let confirmDel;

            if (Elements.CheckAll() && Elements.CheckAll().checked) {
                confirmDel = confirm("Are you sure you want to delete all records?");
            } else {
                confirmDel = confirm("Are you sure you want to delete the selected record(s)?");
            }

            if (confirmDel) {
                let deletionResults = [];  // To track successes and failures

                // Create an array of promises that will delete all records
                const deletePromises = checkBoxArray.map(id => {

                    // Create a promise for each deletion and return it
                    return Delete_Record('leads', id)
                        .then(() => {
                            deletionResults.push({ id, status: 'success' });
                        })
                        .catch((error) => {
                            deletionResults.push({ id, status: 'failed', error });
                        });
                });

                try {
                    // Wait for all promises to be resolved using Promise.all
                    await Promise.all(deletePromises);

                    // After all deletion attempts are made, handle the results
                    let successCount = deletionResults.filter(res => res.status === 'success').length;
                    let failCount = deletionResults.filter(res => res.status === 'failed').length;

                    // Example of user feedback after attempting to delete
                    if (successCount > 0) {
                        alert(`${successCount} record(s) successfully deleted.`);
                    }
                    if (failCount > 0) {
                        alert(`${failCount} record(s) failed to delete.`);
                    }
                    location.reload();
                } catch (error) {
                    // In case any error occurs outside of individual deletion failures
                    alert('There was an error attempting to delete records.');
                }

            } else {
                return;
            }
        } else {
            alert("Please select at least one record to delete.");
        }
    });
    document.querySelector('#ListTable').addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (row && row.id) {
            const clickedTd = e.target.closest('td');
            const checkboxCell = clickedTd && clickedTd.querySelector('.checkBox');
            if (!checkboxCell) {
                window.location.href = '/templates/leads/viewleadDetail.html?id=' + row.id;
            }
        }
    })
}


let checkBoxArray = [];
function CheckBox() {
    const tbody_allCheckboxes = Table.querySelectorAll('tbody .checkBox');

    // function for checkbox in table head 
    Elements.CheckAll().addEventListener("change", (e) => {
        if (Elements.CheckAll().checked) {
            tbody_allCheckboxes.forEach(e => {
                e.checked = Elements.CheckAll().checked;
                checkBoxArray.push(e.id);
            })
        }
        else {
            checkBoxArray.length = 0;
            tbody_allCheckboxes.forEach(e => {
                e.checked = Elements.CheckAll().checked;
            })
        }
        leadActions()
    })

    // if all items checked by separately or some items selected
    tbody_allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            checkBoxArray = e.target.checked
                ? [...checkBoxArray, e.target.id] // Create a new array with the added ID
                : checkBoxArray.filter(id => id !== e.target.id); // Remove the unchecked ID

            if (checkBoxArray.length == tbody_allCheckboxes.length) {
                Elements.CheckAll().indeterminate = false;
                Elements.CheckAll().checked = true;
            } else if (checkBoxArray.length > 0) {
                Elements.CheckAll().checked = false;
                Elements.CheckAll().indeterminate = true;
            } else {
                Elements.CheckAll().indeterminate = false;
                Elements.CheckAll().checked = false
            }
            leadActions()
        })
    })

}
// Show Hide lead Action ribbon;
function leadActions() {
    if (checkBoxArray.length !== 0) {
        document.querySelector(".optionsRow").style.display = "flex";
        document.querySelector(".topRow1").style.display = "none";
        document.querySelector(".topRow2").style.display = "none";
    } else {
        document.querySelector(".optionsRow").style.display = "none";
        document.querySelector(".topRow1").style.display = "flex";
        document.querySelector(".topRow2").style.display = "flex";
    }
}



// filter Function
let FilteredLeads = [];
const selectElement = document.querySelector("#filterSelect");
const searchInput = document.querySelector("#search-input");


function filterFunction() {
    selectElement.appendChild(option_fragment_array(table_headers));

    selectElement.addEventListener("change", () => {
        if (selectElement.value !== "") {
            buttons.FilterBtn().classList.remove('hide-display')
            buttons.ClearFilterBtn().classList.remove('hide-display');
        } else {
            buttons.FilterBtn().classList.add('hide-display');
            buttons.ClearFilterBtn().classList.add('hide-display');
        }

    })
    buttons.FilterBtn().addEventListener('click', (e) => {
        e.preventDefault();
        const key = searchInput.value;
        const type = selectElement.value;
        if (key !== '') {
            FilteredLeads = Leads.filter((lead) => {
                if (LeadMap[type]) {
                    return LeadMap[type](lead).toLowerCase().includes(key.toLowerCase())
                }
                if (OrgMap[type]) {
                    return OrgMap[type](lead).toLowerCase().includes(key.toLowerCase())
                }
                if (DealMap[type]) {
                    return DealMap[type](lead).toLowerCase().includes(key.toLowerCase())
                }
                if (ContactMap[type]) {
                    return ContactMap[type](lead).toLowerCase().includes(key.toLowerCase())
                }
            })
            Table.replaceChildren(table_fragment(table_headers, FilteredLeads))
            CheckBox();
        }
    })
    buttons.ClearFilterBtn().addEventListener('click', (e) => {
        e.preventDefault();
        Table.replaceChildren(table_fragment(table_headers, Leads));
        buttons.FilterBtn().classList.add('hide-display')
        buttons.ClearFilterBtn().classList.add('hide-display');
        searchInput.value = '';
        selectElement.value = '';
        CheckBox();
    })


}
