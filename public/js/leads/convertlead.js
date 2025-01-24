import { getData, getParams, option_fragment_array, UpdateAccount } from '../commonFunctions.js'
import { declarations } from './leadDeclarations.js';

const id = getParams(window.location.search).id;

let Lead, Pipelines, Account;

async function main() {
    await getFromDB();
    setPipelines();
    events();
}
main();
async function getFromDB() {
    Lead = await getData(`leads/${id}`);
    Pipelines = await getData(`pipelines`);
    Pipelines = new Map(Pipelines.map(item => {
        const keys = Object.keys(item).filter(key => key != '_id');
        return [keys[0], item[keys[0]]];
    }))
    Account = await getData(`accounts`)
    Account = Account.find(item => item._id == Lead['org-id']);
}
function setPipelines() {
    // const pipeline = Pipelines.flatMap(obj =>
    //     Object.keys(obj).filter(key => key !== '_id')
    // );
    declarations.pipeline().appendChild(option_fragment_array(Array.from(Pipelines.keys())));
    setStages(declarations.pipeline().value);
}

function setStages(pipeline) {
    let stages = Pipelines.get(pipeline);
    declarations.stage().replaceChildren(option_fragment_array(Object.keys(stages)));
}

function events() {
    document.querySelector('#cta-cancel').addEventListener('click', () => window.history.back());
    declarations.pipeline().addEventListener('change', (e) => {
        e.preventDefault();
        let pipeline = e.target.value;
        setStages(pipeline);
    })
    flatpickr('#closing-date', {
        dateFormat: "M d, Y",
        defaultDate: new Date(),
    });
    if (!Account) document.querySelector('#create-deal').setAttribute('disabled', '')
    document.querySelector('#create-deal').addEventListener('change', (e) => {
        e.preventDefault();
        e.target.checked ? document.querySelector('.deal-box').classList.remove('hidden-field') : document.querySelector('.deal-box').classList.add('hidden-field');
        document.querySelector('#convert-form').removeAttribute('novalidate', '');
    })
    document.querySelector('#name').textContent = Account ? `( ${Account['org-name']} - ${Lead['last-name']} )` : Lead['last-name'];
    document.querySelector('#lead-name').textContent = `${Lead['first-name']} ${Lead['last-name']}`;

    document.querySelector('#convert-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        // create new contact
        let contact_id = await createContact(Lead);
        await deleteLead(Lead['_id']);
        // update the account
        if (Account) {
            Account.leads = Account.leads.filter(item => item != Lead['_id'])
            Account.contacts.push(Lead['_id']);
            await UpdateAccount(Lead['org-id'], Account)
            // create new deal
            if (document.querySelector('#create-deal').checked) {
                const formData = new FormData(e.target);
                formData.append('org-id', Lead['org-id']);
                formData.append('contact-id', contact_id);
            }
        }
        if (contact_id) window.location.href = '/templates/contacts/viewContactDetail.html?id=' + contact_id;
    })
}

async function createContact(data) {
    try {
        let response = await fetch('/mongodb/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
        let result = await response.json();
        return result.id;
    } catch (error) {
        throw new Error(error);
    }
}

async function deleteLead(id) {
    try {
        let response = await fetch(`/mongodb/leads/${id}`, {
            method: 'DELETE',
            headers: { 'Content-type': 'application/json' }
        })
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
        return true;
    } catch (error) {
        throw new Error(error);
    }
}