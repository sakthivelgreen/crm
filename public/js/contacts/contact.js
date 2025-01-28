import { ContactMap, DealMap, LeadMap, OrgMap } from "../../mappings/keyMap.js";
import { Delete_Record, getData, table_fragment, option_fragment_array, UpdateAccount, Filter_ID } from "../commonFunctions.js";
import { buttons, Elements } from '../declarations.js';
// create a contact (redirects to contact creation page)
const createLeadBtn = document.querySelector("#createContactBtn");
const Table = document.querySelector("#ListTable");

// setting table head value from object by converting array
const table_headers = ["First Name", "Last Name", "Email", "Phone", "Date Created"]
let Contacts, Accounts;
async function main() {
    Contacts = await getData('contacts');
    Accounts = await getData('accounts')
    Table.appendChild(table_fragment(table_headers, Contacts, 'contact'))
    events();
    filterFunction();
}
main();

function events() {
    createLeadBtn.addEventListener("click", () => {
        window.location.href = '/templates/contacts/createContact.html';
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
                const updateAccounts = checkBoxArray.map(id => {
                    let obj = Filter_ID(Accounts, id, 'contacts');
                    return UpdateAccount(obj._id, obj)
                })
                // Create an array of promises that will delete all records
                const deletePromises = checkBoxArray.map(id => {

                    // Create a promise for each deletion and return it
                    return Delete_Record('contacts', id)
                        .then(() => {
                            deletionResults.push({ id, status: 'success' });
                        })
                        .catch((error) => {
                            deletionResults.push({ id, status: 'failed', error });
                        });
                });

                try {
                    await Promise.all(updateAccounts);
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
                window.location.href = '/templates/contacts/viewContactDetail.html?id=' + row.id;
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
        contactActions()
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
            contactActions()
        })
    })

}
// Show Hide contact Action ribbon;
function contactActions() {
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
let FilteredContacts = [];
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
            FilteredContacts = Contacts.filter((contact) => {
                if (LeadMap[type]) {
                    return LeadMap[type](contact).toLowerCase().includes(key.toLowerCase())
                }
                if (OrgMap[type]) {
                    return OrgMap[type](contact).toLowerCase().includes(key.toLowerCase())
                }
                if (DealMap[type]) {
                    return DealMap[type](contact).toLowerCase().includes(key.toLowerCase())
                }
                if (ContactMap[type]) {
                    return ContactMap[type](contact).toLowerCase().includes(key.toLowerCase())
                }
            })
            Table.replaceChildren(table_fragment(table_headers, FilteredContacts, 'contact'))
            CheckBox();
        }
    })
    buttons.ClearFilterBtn().addEventListener('click', (e) => {
        e.preventDefault();
        Table.replaceChildren(table_fragment(table_headers, Contacts, 'contact'));
        buttons.FilterBtn().classList.add('hide-display')
        buttons.ClearFilterBtn().classList.add('hide-display');
        searchInput.value = '';
        selectElement.value = '';
        CheckBox();
    })


}
