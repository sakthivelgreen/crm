const createLeadBtn = document.querySelector("#createLeadBtn");
createLeadBtn.addEventListener("click", () => {
    window.location.href = '/templates/leads/createleads.html';
})

const filterContainer = document.querySelector("#filterContainer");
const leadListContainer = document.querySelector("#leadListContainer");
const filterBtn = document.querySelector("#filter");
let flag = false;

filterBtn.addEventListener("click", () => {
    if (!flag) {
        filterContainer.style.width = "0%";
        setTimeout(() => {
            filterContainer.style.display = "none";
        }, 500);
        filterBtn.classList.remove("active");
        flag = !flag;
        console.log(flag);

    } else {
        setTimeout(() => {
            filterContainer.style.width = "30%";
        }, 10);
        filterBtn.classList.add("active");
        filterContainer.style.display = "block";
        flag = !flag;
        console.log(flag);

    }
})


async function fetchLeads() {
    let leads = [];
    try {
        const response = await fetch("http://localhost:3000/lead", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        leads = await response.json();
        processLeads(leads);

    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}

fetchLeads();

const leadTable = document.querySelector("#leadListTable");
const thead = document.createElement("thead");
const tbody = document.createElement("tbody");
leadTable.appendChild(thead);
leadTable.appendChild(tbody);

async function processLeads(leadsData) {

    let Arr = Object.keys(leadsData[0]);
    for (let i = 1; i < Arr.length; i++) {
        const td = document.createElement("th");
        td.textContent = Arr[i].toUpperCase();
        thead.appendChild(td)
    }
    for (const key in leadsData) {
        let value = leadsData[key];
        const tr = document.createElement("tr");
        for (i = 1; i < Object.keys(value).length; i++) {
            const td = document.createElement("td");
            td.innerHTML = `<span id="${value.id}" class="${Arr[i]}">${value[Arr[i]]}</span>`;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    const tableSpan = leadTable.querySelectorAll("span");
    viewDetail(tableSpan)
}


function viewDetail(allSpan) {
    let spanArray = Array.from(allSpan);
    spanArray.forEach(ele => ele.addEventListener("click", leadClick));
    function leadClick(e) {
        if (e.target.className === "email") {
            window.location.href = `mailto:${e.target.textContent}`;
        } else if (e.target.className === "phone") {
            window.location.href = `tel:${e.target.textContent}`;
        } else {
            window.location.href = `/templates/leads/viewleadDetail.html?id=${e.target.id}`;
        }

    }
}



