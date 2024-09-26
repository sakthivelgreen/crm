// declarations
const form = document.querySelector("form");
const saveAccountBtn = document.querySelector("#saveAccountBtn");
const saveAndNewBtn = document.querySelector("#btnSaveAndNew");
const orgNameInput = document.querySelector("#companyname");
const orgEmailInput = document.querySelector("#orgEmail");
const orgPhoneInput = document.querySelector("#orgphone");
const orgAddressInput = document.querySelector("#orgaddress")

orgNameInput.setAttribute("required", "required")

// Cancel Button function
const cancel = document.getElementById("cancelBtn");
cancel.onclick = () => window.location.href = `/templates/accounts.html`;

// Switching Variable btw _Save and _Save and New
let switchVariable = 0;

//save and new
saveAndNewBtn.addEventListener("click", () => {
    switchVariable = 1;
    form.requestSubmit();
})


// Save Account
saveAccountBtn.addEventListener("click", () => {
    switchVariable = 0;
    form.requestSubmit();
})


form.addEventListener("submit", (e) => {
    e.preventDefault();
    let accountObject = {
        organisation_name: orgNameInput.value,
        organisation_email: orgEmailInput.value,
        organisation_phone: orgPhoneInput.value,
        organisation_address: orgAddressInput.value,
        contacts: []
    }
    storeData(accountObject);
})

async function storeData(obj) {
    try {
        let response = await fetch("http://localhost:3000/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        }).then(console.log("success"))
        if (response.ok) {
            if (switchVariable === 0) window.location.href = "/templates/accounts.html";
            else window.location.href = "/templates/accounts/createAccount.html";
            return;
        }
    } catch (error) {
        console.error(error);

    }
}