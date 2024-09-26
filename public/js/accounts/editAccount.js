// getting id
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let id = urlParams.get("id");

let url = "http://localhost:3000/accounts/";

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
cancel.onclick = () => window.location.href = `/templates/accounts/viewAccounts.html?id=${id}`;

// account Fetch
async function fetchAccount() {
    try {
        let response = await fetch(url + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
        if (!response.ok) throw new Error("Cannot Fetch Account")
        let res = await response.json();
        setInputValues(res);
        updateAccount(res);
    } catch (error) {
        console.log(error);
    }
}

fetchAccount()// Calling the function

async function setInputValues(res) {
    orgNameInput.value = res.organisation_name;
    orgAddressInput.value = res.organisation_address;
    orgPhoneInput.value = res.organisation_phone;
    orgEmailInput.value = res.organisation_email;
}


// Switching Variable btw _Save and _Save and New
let switchVariable = 0;

//save and new
saveAndNewBtn.addEventListener("click", () => {
    switchVariable = 1;
    form.requestSubmit();
})


// Save Account
saveAccountBtn.addEventListener("click", () => {
    form.requestSubmit();
})

function updateAccount(obj) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        obj.organisation_name = orgNameInput.value,
            obj.organisation_email = orgEmailInput.value,
            obj.organisation_phone = orgPhoneInput.value,
            obj.organisation_address = orgAddressInput.value,
            storeData(obj);
    })
}

async function storeData(obj) {
    try {
        let response = await fetch("http://localhost:3000/accounts/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        })
        if (response.ok) {
            if (switchVariable === 0) window.location.href = "/templates/accounts.html";
            else window.location.href = "/templates/accounts/createAccount.html";
            return;
        } else {
            throw new Error("Error");

        }
    } catch (error) {
        console.log(error);

    }
}