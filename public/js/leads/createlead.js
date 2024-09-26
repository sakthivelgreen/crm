// Cancel Button
const cancel = document.querySelector("#cancelBtn");
cancel.addEventListener("click", () => {
    window.location.href = "/templates/leads.html";
})

// Getting Input box Fields
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

const leadCreateForm = document.querySelector("#createLeadForm");
const saveLead = document.querySelector("#saveLeadBtn");
const leadSaveandNew = document.querySelector("#btnSaveAndNew");

let clicked = null;

saveLead.addEventListener("click", () => {
    clicked = 1;
    leadCreateForm.requestSubmit();
})
leadSaveandNew.addEventListener("click", () => {
    clicked = 0;
    leadCreateForm.requestSubmit();
})
leadCreateForm.addEventListener("submit", createLead)

// Function add lead
async function createLead(e) {
    e.preventDefault();
    let lastName = checkRequired(lastnameInput);
    let Email = checkRequired(emailInput);
    let Phone = checkRequired(phoneInput)
    let firstName = firstnameInput.value;
    let companyName = companynameInput.value;
    let Address = addressInput.value;
    let Designation = designationInput.value;
    let Product = productInput.value;
    let OrgPhone = orgPhoneInput.value;
    let OrgEmail = orgEmailInput.value;
    let OrgIncome = orgIncomeInput.value;
    let OrgAddress = orgAddressInput.value;

    let newLead = {
        firstname: firstName,
        lastname: lastName,
        email: Email,
        phone: Phone,
        companyname: companyName,
        address: Address,
        designation: Designation,
        product: Product,
        orgphone: OrgPhone,
        orgemail: OrgEmail,
        orgincome: OrgIncome,
        orgaddress: OrgAddress,
    }
    if (lastName && Email && Phone) {
        try {
            const leadFetch = await fetch("/mongodb/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLead)
            })
            if (leadFetch.ok) {
                showAlert("Lead Added Successfully");
                clicked ? window.location.href = '/templates/leads.html' : window.location.href = "/templates/leads/createleads.html";
            } else {
                throw new Error('Failed to add lead: ' + leadFetch.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert("Failed to add lead. Please try again.")
        }
    }
    else {
        showAlert("Please Fill out Required Fields");
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
        setError(tag, "required");
        return;
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
                console.log("default");
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

// Dynamic Fields for Individual and Organisation
let ORG = document.querySelector("#organisation");
let IND = document.querySelector("#individual");
const ORGForm = document.querySelector(".orgForm");
const fieldSet = document.querySelector("fieldset");
ORGForm.style.display = "none";
fieldSet.addEventListener("change", () => {
    if (IND.checked) {
        ORGForm.style.display = "none";
    } else if (ORG.checked) {
        ORGForm.style.display = "block";
    }
})
