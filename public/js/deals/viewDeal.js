import { getParams, back, dateFormat, dateOptions } from '../commonFunctions.js';
import { declarations } from './dealDeclarations.js';
import { getDeal, getPipeline, updateStage } from './dealModule.js';


// redirect -> Back
back(declarations.previousPage());

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

