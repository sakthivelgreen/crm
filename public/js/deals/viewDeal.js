import { getParams, back, dateFormat, dateOptions } from '../commonFunctions.js';
import { declarations } from './dealDeclarations.js';
import { API_Endpoint, getDeal, getPipeline, updateStage } from './dealModule.js';
import { PopUp } from '../../components/popup.js';

// redirect -> Back
declarations.previousPage().addEventListener('click', () => {
    window.open('/templates/deals.html', '_self')
});

// Deal ID from Parameter
const dealID = getParams(window.location.search).id;


// Main Function()
async function main() {
    const obj = await getDeal(dealID);
    setValues(obj)

}
main();              // Main function call. 

function setValues(obj) {
    document.title = `${obj.dealname} (Deal) - Zoho CRM`;
    declarations.pageTitle().textContent = obj.dealname;
    declarations.dealClosingDate().textContent = dateFormat(new Date(obj.dealclosingdate), dateOptions);
    declarations.dealName().textContent = obj.dealname;
    declarations.accountName().textContent = obj.dealaccount;
    declarations.contactName().textContent = obj.dealcontact;
    declarations.dealPipeline().textContent = obj.dealpipeline;
    declarations.dealStage().textContent = obj.dealstage;
    declarations.dealAmount().textContent = obj.dealamount;
    events(obj);
    setStage(obj);
}


function events(obj) {
    declarations.dealEditBtn().addEventListener('click', () => window.open(`/templates/deals/editDeal.html?id=${dealID}`, '_self'));
    declarations.stageCurrent().addEventListener('click', async (e) => {
        if (e.target.tagName === "SPAN") {
            await updateStage(obj, e.target.id);
            window.location.reload();
        }
    })
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
    declarations.deleteBtn().addEventListener('click', handleDelete);
}

async function setStage(obj) {
    const pipeline = await getPipeline(obj.dealpipeline);
    for (const stage in pipeline) {
        const div = document.createElement('span');
        div.id = stage;
        div.className = 'stage';
        if (stage === obj.dealstage) div.classList.add('current');
        if (pipeline[stage] === 100) div.classList.add('success');
        if (pipeline[stage] === 0) div.classList.add('failure');
        div.textContent = stage.charAt(0).toUpperCase() + stage.slice(1);
        declarations.stageCurrent().appendChild(div);
    }
}

async function handleDelete(e) {
    const popup = new PopUp("Confirm Delete", "Delete", "red");
    document.body.appendChild(popup);
    popup.confirm().then((ok) => {
        if (ok) deleteDeal();
    })

}
async function deleteDeal() {
    try {
        let response = await API_Endpoint.delete(dealID);
        if (response) window.open('/templates/deals.html', '_self');
    } catch (error) {
        console.error(error);
        alert('Error in Deletion')
    }
}