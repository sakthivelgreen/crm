const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let leadID = urlParams.get('id');

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
const leadSaveandNew = document.querySelector("#btnSaveAndNew");

let url = "/mongodb/leads/" + leadID;
fetchLeads();
async function fetchLeads() {
    let leads = [];
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        leads = await response.json();
        setLeads(leads);

    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}
const titleElement = document.querySelector('title');
function setLeads(lead) {
    titleElement.textContent = `Edit - ${lead.firstname} ${lead.lastname}`;
    for (const key in lead) {
        if (key === "id") continue;
        switch (key) {
            case "firstname":
                firstnameInput.value = lead[key];
                break;
            case "lastname":
                lastnameInput.value = lead[key];
                break;
            case "email":
                emailInput.value = lead[key];
                break;
            case "phone":
                phoneInput.value = lead[key];
                break;
            case "companyname":
                companynameInput.value = lead[key];
                break;
            case "designation":
                designationInput.value = lead[key];
                break;
            case "product":
                productInput.value = lead[key];
                break;
            case "orgphone":
                orgPhoneInput.value = lead[key];
                break;
            case "orgemail":
                orgEmailInput.value = lead[key];
                break;
            case "orgincome":
                orgIncomeInput.value = lead[key];
                break;
            case "address":
                addressInput.value = lead[key];
                break;
            case "orgaddress":
                orgAddressInput.value = lead[key];
                break;
        }

    }
}

// cancel Button
const cancel = document.querySelector("#cancelBtn");
cancel.addEventListener("click", () => {
    window.location.href = "/templates/leads/viewleadDetail.html?id=" + leadID;
})

// Save lead
const saveLead = document.querySelector("#saveLeadBtn");
const leadSaveForm = document.querySelector("#createLeadForm");

let clicked = null;

saveLead.addEventListener("click", () => {
    clicked = 1;
    leadSaveForm.requestSubmit();
})
leadSaveandNew.addEventListener("click", () => {
    clicked = 0;
    leadSaveForm.requestSubmit();
})

leadSaveForm.addEventListener("submit", async (e) => {
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

    let updateLead = {
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
    await updateRecord(updateLead);
})

async function updateRecord(updateLead) {
    console.log(updateLead);

    try {
        const leadFetch = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateLead)
        })
        if (leadFetch.ok) {
            showAlert("Updated Added Successfully");
            clicked ? window.location.href = '/templates/leads/viewleadDetail.html?id=' + leadID : window.location.href = "/templates/leads/createleads.html";
        } else {
            throw new Error('Failed to add lead: ' + leadFetch.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert("Failed to add lead. Please try again.")
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
                console.log("Error");
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