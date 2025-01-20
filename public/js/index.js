import { getData, getRandomColor } from './commonFunctions.js';
import { Elements } from './declarations.js';

let Leads, Accounts, Deals, Contacts, Pipelines;
let Chart_Pipeline;
async function main() {
    Leads = await getData('leads');
    Contacts = await getData('contacts');
    Accounts = await getData('accounts');
    Deals = await getData('deals');
    Pipelines = await getData('pipelines');
    Pipelines = new Map(Pipelines.map((item) => {
        for (const key in item) {
            if (key !== '_id') {
                return [key, item[key]];
            }
        }
    }))
    populateData();
    events();
} main();

function populateData() {
    Elements.No_of_accounts().textContent = Accounts.length;
    Elements.No_of_contacts().textContent = Contacts.length;
    Elements.No_of_deals().textContent = Deals.length;
    Elements.No_of_leads().textContent = Leads.length;
    const Pipeline_Names = [...Pipelines.keys()];
    Pipeline_Names.forEach((item, index) => {
        const option = document.createElement('option');
        option.textContent = item.slice(0, 1).toUpperCase() + item.slice(1).toLowerCase();
        option.id = item;
        option.value = item;
        option.selected = index === 0;
        document.querySelector('#select-pipeline').appendChild(option);
    })
    pipeline();
}

function events() {
    document.querySelectorAll('.lead-container').forEach(item => item.addEventListener('click', () => { window.location.href = '/templates/leads.html' }))
    document.querySelectorAll('.contact-container').forEach(item => item.addEventListener('click', () => { window.location.href = '/templates/contacts.html' }))
    document.querySelectorAll('.account-container').forEach(item => item.addEventListener('click', () => { window.location.href = '/templates/accounts.html' }))
    document.querySelectorAll('.deal-container').forEach(item => item.addEventListener('click', () => { window.location.href = '/templates/deals.html' }))
    document.querySelector('#select-pipeline').addEventListener('change', (e) => {
        if (Chart_Pipeline) Chart_Pipeline.destroy();
        pipeline();
    })

}

function pipeline() {
    const Pipeline_Container = document.querySelector('#pipeline');
    const Select_Pipeline_html = document.querySelector('#select-pipeline');
    let data = Pipelines.get(Select_Pipeline_html.value);
    data = Object.keys(data);
    let deals_on_pipelines = Deals.filter((item) => item.dealpipeline == Select_Pipeline_html.value);
    let values = deals_on_pipelines.reduce((acc, deal) => {
        acc[deal.dealstage] = (acc[deal.dealstage] || 0) + 1;
        return acc;
    }, {});
    const completeDealCounts = data.map(stage => (values[stage] || 0));
    pipeline_chart(Pipeline_Container, data, completeDealCounts)
}

function pipeline_chart(Pipeline_Container, Pipeline_Names, data) {
    const backgroundColors = Pipeline_Names.map(() => getRandomColor());
    Chart_Pipeline = new Chart(Pipeline_Container, {
        type: 'doughnut',
        data: {
            labels: Pipeline_Names,
            datasets: [{
                label: 'Deals',
                data: data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,  // Disable the legend
                },
                tooltip: {
                    enabled: true,  // Disable tooltips
                }
            }
        }
    })
}

