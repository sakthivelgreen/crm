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
        if (response.status === 404) throw new Error(response.statusText);

    } catch (error) {
        throw new Error(error);
    }

}
