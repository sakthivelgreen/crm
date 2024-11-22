const url = window.location.search;
const query = new URLSearchParams(url);
const id = query.get("id");

const fetchUrl = `/mongodb`;
const div = document.querySelector(".container");
const companyDiv = document.querySelector(".hasCompany");
const noCompanyDiv = document.querySelector(".hasNoCompany");
const convertBtn1 = document.querySelector("#ConvertBtn1");
const convertBtn2 = document.querySelector("#ConvertBtn2");
const contactOnly = document.querySelector("#contact");
const contactAndAccount = document.querySelector("#contactAndaccount");
const getHeaders = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
}

conversionMain()
async function conversionMain() {
    try {
        let response = await fetch(`${fetchUrl}/leads/${id}`, { getHeaders });
        let lead = await response.json();
        if (response.status === 404);
        conversionSub(lead);
    } catch (error) {

    }

}

function conversionSub(lead) {
    if (lead.companyname !== "") {
        hasCompany(lead)
    } else if (lead.companyname === "") {
        hasNoCompany(lead)

    }
}

function hasCompany(lead) {
    let forOrg = {
        organisation_name: lead.companyname,
        organisation_email: lead.orgemail,
        organisation_phone: lead.orgphone,
        organisation_address: lead.orgaddress,
        organisation_income: lead.orgincome,
        designation: lead.designation,
        contacts: [lead._id]
    }
    let forIndividual = {
        _id: lead._id,
        firstname: lead.firstname,
        lastname: lead.lastname,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        product: lead.product
    }
    companyDiv.style.display = "flex";
    document.getElementById("leadname1").value = `${lead.firstname} ${lead.lastname}`;
    convertBtn1.addEventListener("click", async () => {

        if (contactOnly.checked) {
            try {
                deleteLead(lead._id);
            } catch (error) {
                throw new Error("Error " + error);
            }

            try {
                let response = await fetch(fetchUrl + "/contacts/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(forIndividual)
                })
                if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
                window.open(`/templates/contacts/viewContactDetail.html?id=${lead._id}`, '_self')
            } catch (error) {
                throw new Error("Error " + error);
            }

        }
        if (contactAndAccount.checked) {
            try {
                deleteLead(lead._id);
            } catch (error) {
                throw new Error("Error " + error);
            }
            try {
                let id = await funPostAccount(forOrg)
                let forContact = {
                    _id: lead._id,
                    firstname: lead.firstname,
                    lastname: lead.lastname,
                    email: lead.email,
                    phone: lead.phone,
                    address: lead.address,
                    product: lead.product,
                    organisation_id: [id]
                }
                await funPostContact(forContact)
            } catch (error) {

            }

        }

    })
}


function hasNoCompany(lead) {
    let forIndividual = {
        _id: lead._id,
        firstname: lead.firstname,
        lastname: lead.lastname,
        email: lead.email,
        phone: lead.phone,
        address: lead.address,
        product: lead.product
    }
    console.log(forIndividual);
    noCompanyDiv.style.display = "flex";
    document.getElementById("leadname2").value = `${lead.firstname} ${lead.lastname}`;
    convertBtn2.addEventListener("click", async () => {
        try {
            deleteLead(lead._id);
        } catch (error) {
            throw new Error("Error " + error);
        }
        try {
            let response = await fetch(fetchUrl + "/contacts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(forIndividual)
            })
            if (!response.ok) {
                throw new Error(response.status + " " + response.statusText);
            }
            window.open(`/templates/contacts/viewContactDetail.html?id=${lead._id}`, '_self')
        } catch (error) {
            throw new Error("Error " + error);
        }

    })
}

function deleteLead(id) {
    let delFetch = fetch(fetchUrl + "/leads/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    })
    delFetch.then("Deleted");
    delFetch.catch("Error in converting Lead!")
}


async function funPostAccount(forOrg) {
    try {
        let postFetchAccount = await fetch(fetchUrl + "/accounts/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(forOrg)
        })
        let result = await postFetchAccount.json();
        return result._id;
    } catch (error) {
        throw new Error("Error " + error);
    }
}
async function funPostContact(obj) {
    try {
        let response = await fetch(fetchUrl + "/contacts/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(obj)
        })
        if (!response.ok) throw new Error("Error in Conversion");
        return window.open(`/templates/contacts/viewContactDetail.html?id=${id}`, '_self')
    } catch (error) {
        throw new Error("Error " + error);
    }
}