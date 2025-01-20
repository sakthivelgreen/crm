import { getData, option_fragment } from '../commonFunctions.js'

// Cancel Button
const cancel = document.querySelector("#cancelBtn");
cancel.addEventListener("click", () => {
    window.location.href = "/templates/leads.html";
})

// Getting Input box Fields
const last_name_Input = document.querySelector("#last-name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");

const leadCreateForm = document.querySelector("#createLeadForm");
const saveLead = document.querySelector("#saveLeadBtn");
const lead_Save_and_New = document.querySelector("#btnSaveAndNew");
const orgForm = document.querySelector('#org-form');

let clicked = null;
let leadSource, Leads;

async function main() {
    Leads = await getData('leads');
    leadSource = await getData('/lead-sources');
    document.querySelector('#lead-source').appendChild(option_fragment(leadSource, 'name'))
    events();
}
main();

function events() {
    flatpickr('#date-created', {
        dateFormat: "M d, Y",
        defaultDate: new Date()
    });

    document.querySelector('#org-name').addEventListener('input', (e) => {
        if (e.target.value !== '') {
            document.querySelector('.org-section').classList.remove('hidden-field')
            document.querySelector('.org-section').classList.add('reset-hidden')
        } else {
            document.querySelector('.org-section').classList.add('hidden-field')
            document.querySelector('.org-section').classList.remove('reset-hidden')
            orgForm.reset();
        }
    })

    saveLead.addEventListener("click", () => {
        clicked = 1;
        leadCreateForm.requestSubmit();
    })

    lead_Save_and_New.addEventListener("click", () => {
        clicked = 0;
        leadCreateForm.requestSubmit();
    })

    leadCreateForm.addEventListener("submit", createLead)
}


// Function add lead
async function createLead(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subFormData = new FormData(orgForm);
    for (let [key, value] of subFormData.entries()) {
        formData.append(key, value);
    }
    let isLastNameValid = checkRequired(last_name_Input);
    let isEmailValid = checkRequired(emailInput);
    let isPhoneValid = checkRequired(phoneInput)
    if (!isLastNameValid || !isEmailValid || !isPhoneValid) {
        console.log('Form validation failed');
        return; // Stop further submission if there are validation errors
    }
    await PostData(formData);
}
async function PostData(formData) {
    try {
        const response = await fetch("/mongodb/leads", {
            method: "POST",
            body: formData
        })
        if (!response.ok) throw new Error(response.statusText);
        alert("Lead Added Successfully");
        clicked ? window.location.href = '/templates/leads.html' : window.location.href = "/templates/leads/createleads.html";
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to add lead. Please try again.")
    }
}
function checkRequired(tag) {
    let val = tag.value;
    if (val === "") {
        // setError(tag, "required");
        tag.setCustomValidity('Enter a Value!')
        tag.reportValidity();
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
                break;
        }
        tag.setCustomValidity('')
        return true;
    }
}


function setError(tag, message) {
    let Error_tag = tag.parentElement.querySelector('.field-error');
    Error_tag.textContent = message;
    Error_tag.classList.remove("hidden-visibility");
}
function setSuccess(tag) {
    let Error_tag = tag.parentElement.querySelector('.field-error');
    Error_tag.textContent = '';
    Error_tag.classList.add("hidden-visibility");
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
    for (let item of Leads) {
        if (item.email === email) {
            setError(tag, "Email Already registered!");
            return false;
        }
    }
    setSuccess(tag);
    return true;
}
