const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let contactID = urlParams.get('id');

const orgID = document.getElementById("orgID");
const oldID = document.getElementById("findID");
const firstnameInput = document.querySelector("#firstname");
const lastnameInput = document.querySelector("#lastname");
const emailInput = document.querySelector("#email");
const companynameInput = document.querySelector("#companyname");
const phoneInput = document.querySelector("#phone");
const productInput = document.querySelector("#product");
const addressInput = document.querySelector("#address");
const designationInput = document.querySelector("#designation");
const orgPhoneInput = document.querySelector("#orgPhone");
const orgEmailInput = document.querySelector("#orgEmail");
const orgIncomeInput = document.querySelector("#orgIncome");
const orgAddressInput = document.querySelector("#orgAddress");
let errorSpan = document.querySelector("#accError");
const contactSaveandNew = document.querySelector("#btnSaveAndNew");

let url = "http://127.0.0.1:3000/contacts/" + contactID;
fetchContacts();
async function fetchContacts() {
    let contacts = [];
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        contacts = await response.json();

        let orgId = oldID.value = contacts["organisation_id"];

        let response2;
        if (orgId.length !== 0) {
            response2 = await fetch("http://127.0.0.1:3000/accounts/" + orgId)
            if (!response2.ok) throw new Error("Error in fetching account " + response2.statusText);
        }
        let org = response2 !== undefined ? await response2.json() : 0;

        setContacts(contacts, org);

    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}
const titleElement = document.querySelector('title');
function setContacts(contact, org) {
    titleElement.textContent = `Edit - ${contact.firstname} ${contact.lastname}`;
    if (org !== 0) {
        orgPhoneInput.value = org["organisation_phone"];
        orgEmailInput.value = org["organisation_email"];
        orgIncomeInput.value = org["organisation_income"];
        orgAddressInput.value = org["organisation_address"];
        orgID.value = org["id"]
    }

    for (const key in contact) {
        if (key === "id") continue;
        switch (key) {
            case "firstname":
                firstnameInput.value = contact[key];
                break;
            case "lastname":
                lastnameInput.value = contact[key];
                break;
            case "email":
                emailInput.value = contact[key];
                break;
            case "phone":
                phoneInput.value = contact[key];
                break;
            case "companyname":
                companynameInput.value = contact[key];
                break;
            case "designation":
                designationInput.value = contact[key];
                break;
            case "product":
                productInput.value = contact[key];
                break;
            case "address":
                addressInput.value = contact[key];
                break;
            default:
                console.log("default in set Contacts field function")
        }

    }
}

// cancel Button
const cancel = document.querySelector("#cancelBtn");
cancel.addEventListener("click", () => {
    window.location.href = "/templates/contacts/viewContactDetail.html?id=" + contactID;
})

// Save contact
const saveContact = document.querySelector("#saveContactBtn");
const contactSaveForm = document.querySelector("#createContactForm");

let clicked = null;

saveContact.addEventListener("click", () => {
    clicked = 1;
    contactSaveForm.requestSubmit();
})
contactSaveandNew.addEventListener("click", () => {
    clicked = 0;
    contactSaveForm.requestSubmit();
})

contactSaveForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let lastName = checkRequired(lastnameInput);
    let Email = checkRequired(emailInput);
    let Phone = checkRequired(phoneInput)
    let firstName = firstnameInput.value;
    let companyName = companynameInput.value;
    let Address = addressInput.value;
    let Designation = designationInput.value;
    let Product = productInput.value;

    let updateContact = {
        firstname: firstName,
        lastname: lastName,
        email: Email,
        phone: Phone,
        address: Address,
        designation: Designation,
        product: Product,
        organisation_id: [],
        companyname: ""
    }

    if ((lastName && Email && Phone !== "") && oldID.value === "" && orgID.value !== "") {
        updateContact.companyname = companyName;
        updateContact["organisation_id"].push(orgID.value);
        await funPostAccount(contactID, orgID.value, "PUT", "PUSH");
        await updateRecord(updateContact);
    }
    if (lastName && Email && Phone !== "") {
        if ((oldID.value !== "") && oldID.value !== orgID.value && (orgID.value !== "")) {
            updateContact.companyname = companyName;
            updateContact["organisation_id"].push(orgID.value);
            await funPostAccount(contactID, orgID.value, "PUT", "PUSH");
            await funPostAccount(contactID, oldID.value, "PUT", "POP");
            await updateRecord(updateContact);
        }
    }
    if ((lastName && Email && Phone !== "") && (oldID.value === "") && (orgID === "")) {
        await updateRecord(updateContact);
    }
    if ((lastName && Email && Phone !== "") && (oldID.value !== "") && (orgID.value === "")) {
        await funPostAccount(contactID, oldID.value, "PUT", "POP");
        await updateRecord(updateContact);
    }
    // if (lastName && Email && Phone !== "") await updateRecord(updateContact);
})

async function updateRecord(updateContact) {

    try {
        const contactFetch = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateContact)
        })
        if (contactFetch.ok) {
            showAlert("Updated Successfully");
            clicked ? window.location.href = '/templates/contacts/viewContactDetail.html?id=' + contactID : window.location.href = "/templates/contacts/createContact.html";
        } else {
            throw new Error('Failed to add contact: ' + contactFetch.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert("Failed to add contact. Please try again.")
    }
}



function showAlert(message) {
    window.alert(message);
}

function checkRequired(tag) {
    let val = tag.value;
    if (val === "") {
        setError(tag, "required");
        showAlert("Please Fill out Required Fields")
        return false;
    } else {
        setSuccess(tag);
        switch (tag.id) {
            case "phone":
                if (!checkphone(val, tag)) return;
                break;
            case "email":
                if (!checkemail(val, tag)) return;
                break;
            default:
                return tag.value;
        }

        return val;
    }
}


function setError(tag, message) {
    tag.placeholder = message;
    tag.classList.add("errorInput");
}
function setSuccess(tag) {
    tag.placeholder = "";
    tag.classList.remove("errorInput");
}

function checkphone(phone, tag) {
    if (/\D/.test(phone)) {
        setError(tag, "Phone Number should contain numbers only.");
        return false;
    }
    if (!/^[6-9]\d{9}/.test(phone)) {
        setError(tag, "Phone number should start with 6-9.");
        return false;
    }
    setSuccess(tag)
    return true;
}
function checkemail(email, tag) {
    if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(email)) {
        setError(tag, "Invalid Email");
        return false;
    }
    setSuccess(tag);
    return true;
}

//  companyname dropDown
let searchAccount;
let accountExist = false;
const dropDownDiv = document.createElement("div");
const parentDiv = companynameInput.parentElement;
const divNewAccount = document.createElement("div");
const newAccountAnchor = document.createElement("a");
newAccountAnchor.textContent = `New Account`;
divNewAccount.appendChild(newAccountAnchor);
divNewAccount.style.cssText = `
border-bottom : 1px solid black;

text-align: center;
`;
newAccountAnchor.style.cssText = `
cursor:pointer;
padding: 15px;
margin:10px;
color: rgba(51, 140, 240, 0.7)
`;
const ulAccount = document.createElement("ul");
dropDownDiv.appendChild(divNewAccount);
dropDownDiv.appendChild(ulAccount);
ulAccount.style.cssText = `
overflow: "auto",
height : 200px; 
`;

companynameInput.addEventListener("click", () => {
    parentDiv.appendChild(dropDownDiv)
    dropDownDiv.className = "dropdownmenu";
})
companynameInput.addEventListener("blur", () => {
    setTimeout(() => {
        parentDiv.removeChild(dropDownDiv);
    }, 400);
})

// account fetch and add data to the list
let accounts = async () => {

    try {
        let response = await fetch("http://localhost:3000/accounts", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            throw new Error("Error in fetching accounts");

        }
        let result = await response.json();
        filterContent(result)
        dropDwon(result)
        return;
    } catch (error) {

    }
}

function dropDwon(result) {
    while (ulAccount.hasChildNodes()) {
        ulAccount.removeChild(ulAccount.firstChild)
    }
    result.forEach(object => {
        const li = document.createElement("li");
        li.textContent = object.organisation_name;
        ulAccount.appendChild(li);
        li.addEventListener("click", () => {
            accountExist = true;
            errorSpan.style.display = "none";
            companynameInput.value = object.organisation_name;
            orgID.value = object.id;
            orgAddressInput.value = object.organisation_address;
            orgEmailInput.value = object.organisation_email;
            orgPhoneInput.value = object.organisation_phone;
            orgIncomeInput.value = object.organisation_income;
        })
    });
}
accounts()


let noMatches = document.createElement("li"); // for displaying "no match found" text
function filterContent(accounts) {

    companynameInput.addEventListener("keyup", () => {
        let value = companynameInput.value;
        if (value === "") {
            companynameInput.value = "";
            orgID.value = "";
            orgAddressInput.value = "";
            orgEmailInput.value = "";
            orgPhoneInput.value = "";
            orgIncomeInput.value = "";
            errorSpan.style.display = "none";
        }
        searchAccount = accounts.filter(item => item.organisation_name.toLowerCase().includes(value))
        if (searchAccount.length === 0) {
            while (ulAccount.hasChildNodes()) {
                ulAccount.removeChild(ulAccount.firstChild)
            }
            accountExist = false;
            noMatches.textContent = `No results found`;
            ulAccount.appendChild(noMatches);
        }
        else dropDwon(searchAccount)
    })

}

// for creating account in pop-up menu
const accPopup = document.querySelector("#popupAcc");
const cancelPopup = document.getElementById("cancelPopup");
cancelPopup.onclick = () => accPopup.close()


newAccountAnchor.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".dialogContainer").style.display = "block";
    accPopup.showModal()
});

const accCreateAnchor = document.querySelector("#createAccount");
accCreateAnchor.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".dialogContainer").style.display = "block";
    accPopup.showModal()
})

// inputs
const accNameInput = document.querySelector("#accName")
const accEmailInput = document.querySelector("#accEmail")
const accIncomeInput = document.querySelector("#accIncome")

const createAccount = document.querySelector("#quickAcc");
createAccount.addEventListener("submit", (e) => {
    e.preventDefault();
    let accObj = {};
    let accName = checkRequired(accNameInput);
    let accEmail = checkRequired(accEmailInput);
    let accIncome = checkRequired(accIncomeInput);
    if (accName && accEmail && accIncome !== "") {
        accObj = {
            organisation_name: accName,
            organisation_email: accEmail,
            organisation_phone: "",
            organisation_address: "",
            organisation_income: accIncome,
            contacts: []
        }
        let success = funPostAccount(accObj, 200, "POST", null);
        if (success) {
            accPopup.close()
        }
    }
})

async function funPostAccount(obj, account, method, operation) {
    if (method === "POST") {
        try {
            let response = await fetch("http://localhost:3000/accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj)
            })
            if (account === 200) return true;
            let result = await response.json();
            return result.id;
        } catch (error) {
            alert("Error Creating Account!")
            throw new Error(error);
        }
    } else if (method === "PUT") {
        try {
            let response = await fetch("http://localhost:3000/accounts/" + account, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) throw new Error("Error in updating contacts id accounts module " + response.statusText);
            let result = await response.json();
            if (operation === "PUSH") {
                result["contacts"].push(obj);
            } else if (operation === "POP") result["contacts"].pop(obj);
            try {
                let response2 = await fetch("http://localhost:3000/accounts/" + account, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(result)
                })
                if (!response2.ok) throw new Error("Error in updating contacts id accounts module " + response2.statusText);

            } catch (error) {
                throw new Error(error);
            }
        } catch (error) {
            throw new Error(error);
        }
        // clicked ? window.location.href = '/templates/contacts.html' : window.location.href = "/templates/leads/createleads.html";
    }
}