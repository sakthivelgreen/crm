import { back, getParams, dateFormat, dateOptions } from '../commonFunctions.js';
import { declarations } from './dealDeclarations.js';
import REST from '../rest.js';
import { getDeal, getPipeline } from './dealModule.js';

// back or cancel
back(declarations.cancelBtn())

// Get id
let dealID = getParams(window.location.search).id;


let Contacts_Endpoint = new REST("/mongodb/contacts");
let Accounts_Endpoint = new REST("/mongodb/accounts");


async function main() {
    let obj = await getDeal(dealID);
    console.log(obj);

    setValues(obj);
}

main();

function setValues(obj) {
    document.title = `Edit Deal ( ${obj.dealname} ) - Zoho CRM`;
    declarations.dealName().value = obj.dealname;
    declarations.dealOwner().value = obj.dealowner;
    declarations.dealAmount().value = obj.dealamount;
    declarations.dealClosingDate().value = dateFormat(new Date(obj.dealclosingdate), dateOptions)
}

