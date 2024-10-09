import REST from "../rest.js";
import { anchorTags, buttons, forms, divElements, popupElements, meetingModulePopupElements } from "../declarations.js";
import { currDate, getTimeWithAMPM, inputValidationEmpty } from "../commonFunctions.js";

anchorTags.upcomingMeetingsNav.parentElement.classList.add("activeLink");

let meetingsObj;
const getMeetings = async () => {
    try {
        let response = await axios.get(`/meetings`);
        return response.data
    } catch (error) {
        console.log(error);
    }
}
getMeetings()
    .then((data) => {
        meetingsObj = data.response.session
        meetingsObj = meetingsObj.sort((a, b) => a.startTimeMillisec - b.startTimeMillisec);
    })
    .then(() => { listMeetings() })
// const hasNoChildNodes = [divElements.meetingsToday, divElements.meetingsTomorrow, divElements.meetingThisMonth].every(el => !el.hasChildNodes());
// if (hasNoChildNodes) {
//     divElements.upcomingMeetingsDiv.classList.add("no")
// }
const listMeetings = async () => {
    for (const meeting of meetingsObj) {
        if ((Date.now() - meeting.startTimeMillisec) < 0) {
            const meetingItem = document.createElement('li');
            meetingItem.id = meeting.meetingKey;
            meetingItem.className = "meetingListItem";
            meetingItem.innerHTML = await meetingListItemStructure(meeting);
            switch (meeting.eventTime) {
                case "Today":
                    divElements.meetingsToday.appendChild(meetingItem)
                    break;
                case "Tomorrow":
                    divElements.meetingsTomorrow.appendChild(meetingItem)
                    break;
                case "This Week":
                    divElements.meetingsThisWeek.appendChild(meetingItem)
                    break;
                case "This Month":
                    divElements.meetingsThisMonth.appendChild(meetingItem)
                    break;
                default:
                    break;
            }
            let link = await getSpecificMeeting(meeting.meetingKey)
            enableMeetingButton(link);
            meetingItem.addEventListener("click", async (e) => {
                if (e.target.id === "meetingStartButton") {
                    window.open(`${link.startLink}`, "_blank ");
                    e.stopPropagation();
                } else if (e.target.parentElement.className === "meetingOptions") {
                    console.log("hi");
                } else {
                    window.location.href = `/templates/meetings/meetingDetail.html?id=${meetingItem.id}`;
                }
            })
        }
    }
}
const getSpecificMeeting = async (meetingKey) => {
    try {
        let response = await fetch(`/meetings/${meetingKey}`);
        let obj = await response.json();
        return obj.session;
    } catch (error) {
        console.log(error)
        throw new Error("Error");
    }
}
const enableMeetingButton = (obj) => {
    let time = obj.startTimeMillisec - (10 * 60 * 1000)
    if (currDate.getTime() >= time) {
        buttons.meetingStartButton().disabled = false;
    }
}

const meetingListItemStructure = async (meeting) => {
    let imgSrc = imgUrl(meeting.timePeriod); // For image url morning, afternoon, evening and night
    const structure = `
            <div class="liDiv" id="div1Meeting">
                <div class="image">
                    <img id="meetingImage" src="${imgSrc}">
                </div>
                <div class="dateAndTime">   
                    <span id="meetingDate">${meeting.sDate}</span>
                    <span id="meetingTime">${meeting.sTime}</span>
                </div>
            </div>
            <div class="liDiv">
                <span id="meetingTopic">${meeting.topic}</span>
            </div>

            <div class="liDiv">
                <img id="presenterImage" src="${meeting.presenterAvatar}">
                <span id="meetingPresenter">${meeting.presenterFullName}</span>
            </div>

            <div class="liDiv">
                <button id="meetingStartButton" disabled>Start</button>
                <span class="meetingOptions">
                    <svg width="30" height="30" viewBox="0 0 10 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="5" cy="9" r="1" fill="#4588F0" stroke="#4588F0" stroke-width="2" />
                        <circle cx="5" cy="15" r="1" fill="#4588F0" stroke="#4588F0" stroke-width="2" />
                        <circle cx="5" cy="21" r="1" fill="#4588F0" stroke="#4588F0" stroke-width="2" />
                    </svg>
                <span>
            </div>
        `;

    return structure;
}
const imgUrl = (timePeriod) => {
    switch (timePeriod) {
        case "MORNING":
            return `/static/new-morning.svg`;
        case "AFTERNOON":
            return `/static/new-afternoon.svg`;
        case "EVENING":
            return `/static/new-evening.svg`;
        case "NIGHT":
            return `/static/new-night.svg`;
        default:
            break;
    }
}


// Popup for create Meeting
let createMeetingForm =
    `<form id='meetingCreateForm'>
        <div class="form-elements-div">
            <label for="meetingTopic">MeetingName</label>
            <input type="text" name="meetingTopic" id="meetingTopic" class="form-elements" required>
        </div>
        <div class="form-elements-div">
            <label for="meetingAgenda">Agenda</label>
            <input type="text" name="meetingAgenda" id="meetingAgenda" class="form-elements">
        </div>
        <div class="form-elements-div">
            <label for="meetingDate">Date</label>
            <input type="text" name="meetingDate" id="meetingDate" class="form-elements" required>
        </div>
        <div class="form-elements-div">
            <label for="meetingTime">Time</label>
            <input type="time" name="meetingTime" id="meetingTime" class="form-elements" required>
        </div>
        <div class="form-elements-div">
            <label for="meetingDurationHours">Duration</label>
            <div class="Duration">
                <span><select id="meetingDurationHours"></select> hr</span>
                <span><select id="meetingDurationMinutes"></select> min</span>
            </div>
        </div>
        <div class="form-elements-div">
            <label for="meetingParticipants">Participants</label>
            <div id="participantsList">
                <input type="email" name="meetingParticipants" id="meetingParticipants" class="form-elements">
            </div>
            <button id="addParticipants" type="button">Add</button>
        </div>
        <div class="form-Buttons">
            <button id="createMeetingSubmitButton" class="meetingPrimaryButton" type="button">Schedule</button>
            <button id="closeMeetingCreateFormButton" class="meetingSecondaryButton" type="button">Cancel</button>
        </div>
    </form >`;

popupElements.meetingCreatePopupDiv.innerHTML = createMeetingForm;
buttons.meetingCreateButton.addEventListener("click", (e) => {
    document.getElementById('backdrop').classList.remove('hidden');
    // Opening popup
    popupElements.meetingCreatePopupDiv.style.display = 'block';
})

meetingModulePopupElements.closeMeetingCreateFormButton().addEventListener("click", () => {
    document.querySelector('form').reset()
    removeAllParticipants();
    ParticipantsEmail = [];
    document.getElementById('backdrop').classList.add('hidden');
    popupElements.meetingCreatePopupDiv.style.display = 'none';
})


// create Meeting
// ------------------------- for Participants ----------------------------------//
let ParticipantsEmail = [];
meetingModulePopupElements.meetingParticipants().addEventListener("focus", () => {
    meetingModulePopupElements.meetingParticipants().addEventListener("keydown", handleKeydown);
});
meetingModulePopupElements.meetingParticipants().addEventListener("blur", () => {
    meetingModulePopupElements.meetingParticipants().removeEventListener("keydown", handleKeydown);
});
function handleKeydown(e) {
    if (e.key === "Enter" || e.key === ',') {
        meetingModulePopupElements.addParticipants().click();
        e.preventDefault();
    }
    if (document.activeElement !== meetingModulePopupElements.meetingParticipants()) {
        meetingModulePopupElements.addParticipants().click();
        e.preventDefault();
    }

    if (meetingModulePopupElements.meetingParticipants().value === "" && e.keyCode === 8) {
        ParticipantsEmail.pop();
        listParticipants()
    }
}
meetingModulePopupElements.addParticipants().addEventListener("click", (e) => {
    if (meetingModulePopupElements.meetingParticipants().value !== "" && !ParticipantsEmail.includes(meetingModulePopupElements.meetingParticipants().value)) {
        meetingModulePopupElements.meetingParticipants().value = meetingModulePopupElements.meetingParticipants().value.trim();
        if (meetingModulePopupElements.meetingParticipants().validity.valid) {
            ParticipantsEmail.push(meetingModulePopupElements.meetingParticipants().value.trim());
            listParticipants()
            meetingModulePopupElements.meetingParticipants().value = ""
            meetingModulePopupElements.meetingParticipants().focus()
        } else {
            alert("invalid Email")
        }
    }
})

function listParticipants() {
    removeAllParticipants();
    ParticipantsEmail.forEach(ele => {
        const i = document.createElement("i");
        i.textContent = "\u2716";
        const li = document.createElement("li");
        li.textContent = `${ele}`
        li.appendChild(i)
        meetingModulePopupElements.participantsList().insertBefore(li, meetingModulePopupElements.participantsList().lastElementChild);
    })
    removeParticipantsEventListener();
}

// ---------- function remove participants --------------------//

const removeAllParticipants = () => {
    let div = meetingModulePopupElements.participantsList();
    let li = div.querySelectorAll('li');
    li.forEach(item => {
        item.remove();
    })
}
const removeParticipantsEventListener = () => {
    meetingModulePopupElements.participantsList().addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.tagName == 'I') {
            let li = e.target.parentNode;
            ParticipantsEmail = ParticipantsEmail.filter(ele => ele !== li.firstChild.textContent);
            listParticipants()
        }
    })
}


// --------------- end remove participants --------------------//

// -------------------------- End Participants -----------------------------------//

// --------------------------- Durations Tag ----------------------------------- //

for (let index = 0; index < 24; index++) {
    let options = document.createElement("option");
    options.value = index;
    index = index.toString().padStart(2, '0')
    options.textContent = index;
    meetingModulePopupElements.meetingDurationHours().appendChild(options);
}

[0, 15, 30, 45].map(ele => {
    let options = document.createElement("option");
    options.value = ele;
    ele = ele.toString().padStart(2, '0');
    options.textContent = ele;
    if (ele === "30") options.selected = true;
    meetingModulePopupElements.meetingDurationMinutes().appendChild(options)
})

// --------------------------- End Duration ------------------------------------ //

// ----------------------------- schedule Button ----------------------------------//
meetingModulePopupElements.createMeetingSubmitButton().addEventListener("click", () => {
    let participants = [];
    if (ParticipantsEmail.length > 0) {
        ParticipantsEmail.forEach(ele => {
            participants.push({ "email": ele })
        })
    }
    if (meetingModulePopupElements.meetingDurationHours().value == 0 && meetingModulePopupElements.meetingDurationMinutes().value == 0) {
        alert("Duration cannot be 0!");
        meetingModulePopupElements.meetingDurationMinutes().value = 30;
        return;
    }
    let duration = (meetingModulePopupElements.meetingDurationHours().value * 60 * 60 * 1000) + (meetingModulePopupElements.meetingDurationMinutes().value * 60 * 1000)
    let obj, validity;
    let form = forms.meetingCreateForm();
    let inputs = form.querySelectorAll("input[required]");
    console.log(inputs);

    inputs.forEach((input) => {
        validity = inputValidationEmpty(input)
        console.log(validity);
    })
    if (!validity) {
        obj = {
            "session": {
                "topic": `${meetingModulePopupElements.meetingTopic().value}`,
                "agenda": `${meetingModulePopupElements.meetingAgenda().value}`,
                "presenter": 60030984640,
                "startTime": `${meetingModulePopupElements.meetingDate().value} ${getTimeWithAMPM(meetingModulePopupElements.meetingTime().value)}`,
                "duration": `${duration}`,
                "timezone": "Asia/Calcutta"
            }
        }
    } else {
        console.log("hi");
        return;

    }

    participants.length > 0 ? obj.session.participants = participants : null
    createMeeting(obj);
})

// ---------------------- Main Function -----------------------//
let MeetingApi = new REST('/meetings');
const createMeeting = async (obj) => {
    try {
        console.log(obj);

        MeetingApi.post(obj)
            .then(() => {
                popupElements.meetingCreatePopupDiv.style.display = 'none';
                document.getElementById('backdrop').classList.add('hidden');
                alert('Meeting Created');
            })
            .then(() => {
                window.location.reload();
            })
            .catch((e) => {
                console.log(e)
            })
    } catch (e) {
        throw new Error(`Error: ${e}`);
    }
}

// ---------------------- End Main Function -------------------//

// --------------------------- end Schedule Button ---------------------------//

// --------------------------------- Date ------------------------------------//

flatpickr(meetingModulePopupElements.meetingDate(), {
    minDate: "today",
    dateFormat: "M d, Y"
})
// ------------------------------- End Date ---------------------------------//
