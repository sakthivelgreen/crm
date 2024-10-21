import REST from "/js/rest.js";

// Redirect to create Deal page
const createDeal = document.querySelector("#createDealBtn");
createDeal.addEventListener("click", () => window.location.href = "/templates/deals/createDeal.html");

// Declarations
const kanbanView = document.querySelector(".kanbanView");
const view = document.querySelector("#view");
let pipelinesArray;

let dealsREST = new REST("/mongodb/deals")
let deals;

function main() {
    dealsREST.get().then((obj) => {
        deals = obj;
    }).then(() => {
        display();
    })
}
main();

function display() {
    // for getting pipelines from resource server;
    let getPipelineREST = new REST('/mongodb/pipelines');
    getPipelineREST.get().then((obj) => {
        pipelinesArray = obj;

        pipelinesArray.forEach(pipeline => {
            for (const pipelineName in pipeline) {
                if (pipelineName === "_id") continue;
                const option = document.createElement("option");
                option.value = pipelineName;
                option.textContent = pipelineName.charAt(0).toUpperCase() + pipelineName.slice(1).toLowerCase();
                view.appendChild(option);
                if (pipelineName === 'standard') option.selected = true;
            }
            for (const stage in pipeline["standard"]) {
                stageView(stage, pipeline["standard"][stage], "standard");
            }
            view.addEventListener("change", () => {
                for (const pipelineName in pipeline) {
                    if (pipelineName === view.value) {
                        while (kanbanView.hasChildNodes()) {
                            kanbanView.removeChild(kanbanView.firstChild)
                        }
                        for (const stage in pipeline[pipelineName]) {
                            stageView(stage, pipeline[pipelineName][stage], pipelineName);
                        }
                    }
                }
            })
        });
    })


    // for Creating stages
    function stageView(stage, value, pipeline) {
        // Append Top Element
        const stageDiv = document.createElement("div");
        stageDiv.className = "stages";
        kanbanView.appendChild(stageDiv);

        // Stage Title Div Content
        const stageTitleDiv = document.createElement("div");
        stageTitleDiv.className = "stageTitleDiv";

        const stageDetailsDiv = document.createElement("div");
        stageDetailsDiv.className = `stageDetailsDiv`;

        const stageAmountTotalDiv = document.createElement("div");
        stageAmountTotalDiv.className = `stageAmountTotalDiv`;

        stageTitleDiv.appendChild(stageDetailsDiv);
        stageTitleDiv.appendChild(stageAmountTotalDiv);

        // Stage Title Div Details
        const title = document.createElement("span");
        title.textContent = stage;
        stageDetailsDiv.appendChild(title)

        const count = document.createElement("span");
        count.className = `count`;
        stageDetailsDiv.appendChild(count);
        count.textContent = 0;

        const score = document.createElement("span");
        score.className = "scorePercentage";
        score.textContent = `${value}%`;
        stageDetailsDiv.appendChild(score);

        const totalAmount = document.createElement("span");
        stageAmountTotalDiv.appendChild(totalAmount);


        if (value === 100) {
            count.classList.add("success")
            stageTitleDiv.classList.add("success")
        }
        if (value === 0) {
            count.classList.add("reject")
            stageTitleDiv.classList.add("reject")
        }

        // Stage Body Div Content
        const stageBody = document.createElement("div");
        stageBody.className = "stageBodyDiv";
        stageBody.id = stage;

        // Appending Title and Body Div
        stageDiv.appendChild(stageTitleDiv);
        stageDiv.appendChild(stageBody);


        /// drag and drop Starts here 
        let placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        stageBody.addEventListener("drop", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            let draggedElementId = e.dataTransfer.getData("text");
            let result = updateStage(draggedElementId, stage);
            if (result) {
                e.target.classList.remove('noContent');
                CheckData(stageBody.id);
                main();
            } else {
                alert("Error Changing Stage Please Refresh the Page!!!")
            }
        });

        stageBody.addEventListener("dragenter", (e) => {
            e.preventDefault();
        })
        stageBody.addEventListener("dragleave", (e) => {
            e.preventDefault();
        })
        stageBody.addEventListener("dragover", (e) => {
            e.preventDefault();
            let draggedElement = document.querySelector(".dragging");
            const afterElement = getDragAfterElement(stageBody, e.clientY);
            if (afterElement == null) {
                stageBody.appendChild(draggedElement); // Append at the end if no elements below
            } else {
                stageBody.insertBefore(draggedElement, afterElement); // Insert before the closest element
            }
            CheckData(stageBody.id)
        })
        dealsFunction(pipeline, stage, stageBody);
        CheckData();

        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.dealsBox:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2; // Calculate offset from the element's midpoint

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    }

}

// for deal div inside the each stage this code is to display deals
function dealsFunction(pipeline, stage, stageBody) {
    for (const deal in deals) {
        let dealVariable = deals[deal];
        if (deals[deal].dealpipeline === pipeline && deals[deal].dealstage === stage) {
            const dealDiv = document.createElement("div");
            dealDiv.id = deals[deal]._id;
            dealDiv.className = "dealsBox";
            dealDiv.draggable = "true";
            stageBody.appendChild(dealDiv);

            // date 
            // Initialize Flatpickr and format the date
            let formatDate = flatpickr.formatDate(new Date(dealVariable.dealclosingdate), "M d, Y");

            const dealName = document.createElement("span")
            const dealAmount = document.createElement("span")
            const dealOwner = document.createElement("span")
            const dealAccount = document.createElement("span")
            const dealContact = document.createElement("span")
            const dealClosingDate = document.createElement("span")

            dealName.className = "dealname"
            dealAmount.className = "dealamount"
            dealOwner.className = "dealowner"
            dealClosingDate.className = "dealclosingdate"
            dealAccount.className = "dealaccount"
            dealContact.className = "dealcontact"
            dealAccount.id = dealVariable.accountID
            dealContact.id = dealVariable.contactID

            dealName.textContent = dealVariable.dealname
            dealAmount.textContent = `\u20B9 ${dealVariable.dealamount}`
            dealOwner.textContent = dealVariable.dealowner
            dealAccount.textContent = dealVariable.dealaccount
            dealContact.textContent = dealVariable.dealcontact
            dealClosingDate.textContent = formatDate

            dealDiv.appendChild(dealName)
            dealDiv.appendChild(dealOwner)
            dealDiv.appendChild(dealAccount)
            dealDiv.appendChild(dealContact)
            dealDiv.appendChild(dealAmount)
            dealDiv.appendChild(dealClosingDate)

            // Event Listeners
            dealDiv.addEventListener('click', (eV) => {
                eV.stopPropagation();
                if (eV.target.className === "dealaccount") {
                    window.location.href = "/templates/accounts/viewAccounts.html?id=" + dealVariable.accountID
                } else if (eV.target.className === 'dealcontact') {
                    window.location.href = "/templates/contacts/viewContactDetail.html?id=" + dealVariable.contactID
                }
                if (eV.target.className === 'dealname') {
                    window.open(`/templates/deals/viewDeals.html?id=${dealDiv.id}`, '_self');
                }
            })

            // drag event listener
            dealDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData("text", e.target.id); // Store the ID of the dragged element
                e.target.classList.add("dragging");
            });
            dealDiv.addEventListener('dragend', async (e) => {
                e.target.classList.remove("dragging")
            })
        }
    }
}

function CheckData(id = null) {
    let stageBodyDiv = document.querySelectorAll(".stageBodyDiv");
    const span = document.createElement("span");
    stageBodyDiv.forEach(stageBody => {
        if (!stageBody.hasChildNodes()) {
            span.textContent = `No Deals Found`;
            span.className = "noDeals";
            stageBody.appendChild(span)
            stageBody.classList.add("noContent");
        }
    })
    if (id !== null) {
        const parent = document.getElementById(id)
        let span = parent.querySelector(".noDeals");
        parent.classList.remove("noContent");
        if (parent.contains(span)) {
            parent.removeChild(span);
        }
    }
}

// Stage Update Function
async function updateStage(id, stage) {
    for (const deal of deals) {
        if (deal._id === id) {
            let obj = deal;
            delete obj._id; // to store in mongodb id should not be given in update object because id cannot modified in MongoDB
            if (deal.dealstage !== stage) {
                deal.dealstage = stage;
                console.log("Working", id, deal);
                await dealsREST.put(id, obj).then((res) => {
                    return true;
                })
            }
        }
    }

}