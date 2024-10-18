// Cancel Button
const cancel = document.querySelector("#cancelBtn");
cancel.addEventListener("click", () => {
    window.location.href = "/templates/contacts.html";
})

// Getting Input box Fields
const orgID = document.getElementById("orgID");
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

const contactCreateForm = document.querySelector("#createContactForm");
const saveContact = document.querySelector("#saveContactBtn");
const contactSaveandNew = document.querySelector("#btnSaveAndNew");
let errorSpan = document.querySelector("#accError");

let ORG = document.querySelector("#organisation");
let IND = document.querySelector("#individual");
const ORGForm = document.querySelector(".orgForm");
const fieldSet = document.querySelector("fieldset");

let clicked = null;

saveContact.addEventListener("click", () => {
    clicked = 1;
    contactCreateForm.requestSubmit();
})
contactSaveandNew.addEventListener("click", () => {
    clicked = 0;
    contactCreateForm.requestSubmit();
})
contactCreateForm.addEventListener("submit", createLead)

// Function add lead
async function createLead(e) {
    e.preventDefault();
    let lastName = checkRequired(lastnameInput);
    let Email = checkRequired(emailInput);
    let Phone = checkRequired(phoneInput)
    let firstName = firstnameInput.value;
    let companyName = checkRequired(companynameInput);
    let Address = addressInput.value;
    let Designation = designationInput.value;
    let Product = productInput.value;
    let OrgPhone = orgPhoneInput.value;
    let OrgEmail = orgEmailInput.value;
    let OrgIncome = orgIncomeInput.value;
    let OrgAddress = orgAddressInput.value;

    let newContact = {
        firstname: firstName,
        lastname: lastName,
        email: Email,
        phone: Phone,
        address: Address,
        designation: Designation,
        product: Product,
        organisation_id: "",
        companyname: ""
    }
    orglead = {
        organisation_name: companyName,
        designation: Designation,
        organisation_email: OrgEmail,
        organisation_phone: OrgPhone,
        organisation_address: OrgAddress,
        organisation_income: OrgIncome,
        contacts: []
    }


    if (IND.checked) {
        if (lastName && Email && Phone !== "") {
            funPostContact(newContact, 0);
        }
        else {
            await showAlert("Please Fill out Required Fields");
        }
    }
    if (ORG.checked) {
        if (lastName && Email && Phone && companyName !== "") {
            if (accountExist) {
                errorSpan.style.display = "none";
                let Orgid = orgID.value;
                newContact = {
                    firstname: firstName,
                    lastname: lastName,
                    email: Email,
                    phone: Phone,
                    companyname: companyName,
                    address: Address,
                    designation: Designation,
                    product: Product,
                    organisation_id: [Orgid]
                }
                let contactID = await funPostContact(newContact, 1);
                funPostAccount(contactID, Orgid, 1);
            } else {
                errorSpan.style.display = "block";
                return;
            }

        }
        else {
            await showAlert("Please Fill out Required Fields");
        }
    }
}


function showAlert(message) {
    return new Promise((resolve) => {
        window.alert(message);
        resolve();
    });
}

function checkRequired(tag) {
    let val = tag.value;
    if (val === "") {
        setError(tag, "required *");
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
            case "firsname":
                return firstnameInput.value;
            case "lastname":
                return lastnameInput.value;
            case "companyname":
                return companynameInput.value;
            case "address":
                return addressInput.value;
            case "product":
                return productInput.value;
            case "designation":
                return designationInput.value;

            default:
                return tag.value;
        }

        return val;
    }
}


function setError(tag, message) {
    tag.placeholder = message;
    tag.classList.add("errorInput");
    if (tag === companynameInput) {
        errorSpan.style.display = "block";
        return false;
    }
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


// Dynamic Fields for Individual and Organisation
ORGForm.style.display = "none";
fieldSet.addEventListener("change", () => {
    if (IND.checked) {
        ORGForm.style.display = "none";
    } else if (ORG.checked) {
        ORGForm.style.display = "block";
    }
})


async function funPostContact(newContact, method) {
    try {
        const contactFetch = await fetch("/mongodb/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContact)
        })
        if (contactFetch.ok) {
            if (method === 0) {
                showAlert("Contact Added Successfully");
                clicked ? window.location.href = '/templates/contacts.html' : window.location.href = "/templates/leads/createleads.html";
            }
        }
        else {
            throw new Error('Failed to add Contact: ' + contactFetch.statusText);
        }
        if (method === 1) {
            let result = await contactFetch.json();
            return result.id;
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert("Failed to add lead. Please try again.")
    }
}

async function funPostAccount(obj, account, method) {
    if (method === 0) {
        try {
            let response = await fetch("/mongodb/accounts", {
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
    } else if (method === 1) {
        try {
            let response = await fetch("/mongodb/accounts/" + account, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (!response.ok) throw new Error("Error in updating contacts id accounts module");
            let result = await response.json();
            result["contacts"].push(obj);
            delete result._id;
            try {
                let response2 = await fetch("/mongodb/accounts/" + account, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(result)
                })
                if (!response2.ok) throw new Error("Error in updating contacts id accounts module");

            } catch (error) {
                throw new Error(error);
            }
        } catch (error) {
            throw new Error(error);
        }
        clicked ? window.location.href = '/templates/contacts.html' : window.location.href = "/templates/leads/createleads.html";
    }
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
        let response = await fetch("/mongodb/accounts", {
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
        dropDown(result)
        return;
    } catch (error) {

    }
}

function dropDown(result) {
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
            orgID.value = object._id;
            orgAddressInput.value = object.organisation_address;
            orgEmailInput.value = object.organisation_email;
            orgPhoneInput.value = object.organisation_phone;
            orgIncomeInput.value = object.organisation_income;
        })
    });
}
accounts()


let noMatches = document.createElement("li");
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
        else dropDown(searchAccount)
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
        let success = funPostAccount(accObj, 200, 0);
        if (success) {
            accNameInput.value = "";
            accEmailInput.value = "";
            accIncomeInput.value = "";
            companynameInput.value = accName;
            orgID.value = success;
            orgEmailInput.value = accEmail;
            orgIncomeInput.value = accIncome;
            accPopup.close()
            accounts()
        }
    }
})