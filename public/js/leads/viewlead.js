const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let leadID = urlParams.get('id');
let isRunning = false;


const backBtn = document.querySelector("#backArrowBtn");
backBtn.addEventListener("click", () => {
    window.location.href = `/templates/leads.html`;
})


let url = "/mongodb/leads/" + leadID;

fetchLeads();

async function fetchLeads() {
    let leads = [];
    try {
        if (isRunning) {
            return;
        }
        isRunning = true;
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (response.status === 404 && isRunning === true) {
            alert("Delete Success")
            window.location.href = `/templates/leads.html`
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        leads = await response.json();
        getLeads(leads);
    }
    catch (error) {
        console.error('Error fetching leads:', error);
    }
    finally {
        isRunning = false;
    }
}
const titleElement = document.querySelector('title');
const table = document.querySelector("#leadTable");
const tbody = document.createElement("tbody");
table.appendChild(tbody);
// get lead
function getLeads(lead) {
    titleElement.textContent = `${lead.firstname} ${lead.lastname}`;
    for (const key in lead) {
        if (key === "id") continue;
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        td1.textContent = key;
        td2.textContent = lead[key];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
}

// Edit redirect 

const editBtn = document.querySelector("#editLead");
editBtn.addEventListener("click", () => {
    window.location.href = `/templates/leads/editlead.html?id=${leadID}`;
})

let flag = false;
const optionBtn = document.querySelector(".options");
optionBtn.onfocus = () => {
    let menu = document.getElementById("dropDown1");
    menu.style.display = "block";
}
optionBtn.onblur = () => {
    setTimeout(() => {
        let menu = document.getElementById("dropDown1");
        menu.style.display = "none";
    }, 300)
}

// Delete Lead 
const deleteLead = document.querySelector("#deleteBtn");
deleteLead.addEventListener("click", (e) => {
    let confirmation = confirm("Are you sure? Delete Lead");
    if (confirmation) {
        try {
            fetch(url, {
                method: "DELETE"
            }).then(() => location.reload())
        } catch (error) {
            console.log(error);
        }
    }

})

const converLeadBtn = document.querySelector("#convertLead");

converLeadBtn.addEventListener("click", () => {
    window.location.href = `/templates/leads/convertlead.html?id=${leadID}`;
})