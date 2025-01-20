import { getData, option_fragment } from '../commonFunctions.js';
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let leadID = urlParams.get('id');

const lastNameInput = document.querySelector("#last-name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const titleElement = document.querySelector('title');
const cancel = document.querySelector("#cancelBtn");
const orgForm = document.querySelector('#org-form');
const leadSaveAndNew = document.querySelector("#btnSaveAndNew");
const saveLead = document.querySelector("#saveLeadBtn");
const leadSaveForm = document.querySelector("#createLeadForm");

let url = "/mongodb/leads/" + leadID;
let Leads, leadSource, clicked = null;

async function main() {
    Leads = await fetchLeads();
    leadSource = await getData('lead-sources');
    setFormData(Leads);
    events();
}
main();

async function fetchLeads() {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}

function setFormData(data) {
    titleElement.textContent = `Edit - ${data['first-name']} ${data['last-name']}`;
    document.querySelector('#lead-source').appendChild(option_fragment(leadSource, 'name'));
    Object.keys(data).forEach(key => {
        const value = data[key];
        const field = document.querySelector(`[name="${key}"], #${key}`);

        if (field) {
            // If the field is a checkbox or radio button
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = value;
            } else {
                // Otherwise, for inputs, textareas, selects, set the value
                field.value = value;
                if (field.name === 'org-name') {
                    enable_disable_form(field);
                }
            }
        }

    });
}

function events() {
    // cancel Button
    cancel.addEventListener("click", () => {
        window.location.href = "/templates/leads/viewleadDetail.html?id=" + leadID;
    })
    flatpickr('#date-created', {
        dateFormat: "M d, Y"
    });
    document.querySelector('#org-name').addEventListener('input', (e) => {
        enable_disable_form(e.target);
    })
    saveLead.addEventListener("click", () => {
        clicked = 1;
        leadSaveForm.requestSubmit();
    })
    leadSaveAndNew.addEventListener("click", () => {
        clicked = 0;
        leadSaveForm.requestSubmit();
    })

    leadSaveForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const subFormData = new FormData(orgForm);
        for (const [key, value] of subFormData.entries()) {
            formData.append(key, value);
        }
        let lastName = checkRequired(lastNameInput);
        let Email = checkRequired(emailInput);
        let Phone = checkRequired(phoneInput)
        if (lastName && Email && Phone) {
            await updateRecord(formData);
        }
    })
}
function enable_disable_form(item) {
    if (item.value !== '') {
        document.querySelector('.org-section').classList.remove('hidden-field')
        document.querySelector('.org-section').classList.add('reset-hidden')
    } else {
        document.querySelector('.org-section').classList.add('hidden-field')
        document.querySelector('.org-section').classList.remove('reset-hidden')
        orgForm.reset();
    }
}
// Save lead
async function updateRecord(updatedLead) {
    try {
        const response = await fetch(url, {
            method: "PUT",
            body: updatedLead
        })
        if (!response.ok) throw new Error(response.statusText);
        alert("Updated Successfully");
        clicked ? window.location.href = '/templates/leads/viewleadDetail.html?id=' + leadID : window.location.href = "/templates/leads/createleads.html";
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to add lead. Please try again.")
    }
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