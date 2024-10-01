import REST from "../rest.js";
import { anchorTags, buttons, forms, ulElements, divElements, popupElements, meetingModulePopupElements } from "../declarations.js";
import { currDate, timeOptions, dateOptions, dateFormat, getTimeWithAMPM } from "../commonFunctions.js";
anchorTags.upcomingMeetingsNav.parentElement.classList.add("activeLink");

let meetingsObj = {};
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
const listMeetings = () => {
    for (const meeting of meetingsObj) {
        if ((Date.now() - meeting.startTimeMillisec) < 0) {
            const meetingItem = document.createElement('li');
            meetingItem.id = meeting.meetingKey;
            meetingItem.className = "meetingListItem";
            meetingItem.innerHTML = meetingListItemStructure(meeting);
            switch (meeting.eventTime) {
                case "Today":
                    divElements.meetingsToday.appendChild(meetingItem)
                    break;
                case "Tomorrow":
                    divElements.meetingsTomorrow.appendChild(meetingItem)
                    break;
                case "This Month":
                    divElements.meetingThisMonth.appendChild(meetingItem)
                    break;
                default:
                    break;
            }
            meetingItem.addEventListener("click", async (e) => {
                if (e.target.id === "meetingStartButton") {
                    try {
                        let response = await fetch(`/meetings/${meeting.meetingKey}`);
                        let obj = await response.json();
                        window.open(`${obj.session.startLink}`, "_blank ");
                    } catch (error) {
                        console.log(error)
                        throw new Error("Error");
                    }
                    e.stopPropagation();
                }
            })
        }
    }
}
const meetingListItemStructure = (meeting) => {
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
                <button id="meetingStartButton">Start</button>
                <span id="meetingOptions">
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
    `<form >
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
            <input type="text" name="meetingDate" id="meetingDate" class="form-elements">
        </div>
        <div class="form-elements-div">
            <label for="meetingTime">Time</label>
            <input type="time" name="meetingTime" id="meetingTime" class="form-elements">
        </div>
        <div class="form-elements-div">
            <label for="meetingDurationHours">Duration</label>
            <select id="meetingDurationHours"></select> <span>hr</span>
            <select id="meetingDurationMinutes"></select> <span>min</span>
        </div>
        <div class="form-elements-div">
            <label for="meetingParticipants">Participants</label>
            <input type="email" name="meetingParticipants" id="meetingParticipants" class="form-elements">
            <button id="addParticipants" type="button" class="meetingSecondaryButton">Add</button>
            <div id="participantsList" class="form-elements">
            </div>
        </div>
        <button id="createMeetingSubmitButton" class="meetingPrimaryButton" type="button">Shedule</button>
        <button id="closeMeetingCreateFormButton" class="meetingSecondaryButton" type="button">Cancel</button>
    </form >`;

popupElements.meetingCreatePopupDiv.innerHTML = createMeetingForm;
buttons.meetingCreateButton.addEventListener("click", (e) => {

    // Set Default date and time as current
    timeOptions.hour12 = false;
    meetingModulePopupElements.meetingTime().value = dateFormat(currDate, timeOptions)
    meetingModulePopupElements.meetingDate().value = dateFormat(currDate, dateOptions, 'en-US')

    // Opening popup
    popupElements.meetingCreatePopupDiv.showModal();
})

meetingModulePopupElements.closeMeetingCreateFormButton().addEventListener("click", () => {
    document.querySelector('form').reset()
    while (meetingModulePopupElements.participantsList().hasChildNodes()) {
        meetingModulePopupElements.participantsList().removeChild(meetingModulePopupElements.participantsList().firstChild)
    }
    popupElements.meetingCreatePopupDiv.close()
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
    if (e.key === "Enter") {
        meetingModulePopupElements.addParticipants().click();
        e.preventDefault();
    }
}
meetingModulePopupElements.addParticipants().addEventListener("click", (e) => {

    if (meetingModulePopupElements.meetingParticipants().value !== "" && !ParticipantsEmail.includes(meetingModulePopupElements.meetingParticipants().value)) {
        if (meetingModulePopupElements.meetingParticipants().validity.valid) {
            ParticipantsEmail.push(meetingModulePopupElements.meetingParticipants().value);
            listParticipants()
            meetingModulePopupElements.meetingParticipants().value = ""
            meetingModulePopupElements.meetingParticipants().focus()
        } else {
            alert("invalid Email")
        }
    }
})

function listParticipants() {
    while (meetingModulePopupElements.participantsList().hasChildNodes()) {
        meetingModulePopupElements.participantsList().removeChild(meetingModulePopupElements.participantsList().firstChild)
    }
    ParticipantsEmail.forEach(ele => {
        const i = document.createElement("i");
        i.textContent = "\u2716";
        const li = document.createElement("li");
        li.textContent = `${ele}`
        li.appendChild(i)
        meetingModulePopupElements.participantsList().appendChild(li);
    })

}

// -------------------------- End Participants -----------------------------------//

// --------------------------- Durations Tag ----------------------------------- //

for (let index = 0; index < 24; index++) {
    index.toString().padStart(2, '0')
    let options = document.createElement("option");
    options.value = index;
    options.textContent = index;
    meetingModulePopupElements.meetingDurationHours().appendChild(options);
}

[0, 15, 30, 45].map(ele => {
    ele = ele.toString().padStart(2, '0');
    let options = document.createElement("option");
    options.value = ele;
    options.textContent = ele;
    if (ele === "00") options.selected = true;
    meetingModulePopupElements.meetingDurationMinutes().appendChild(options)
})

// --------------------------- End Duration ------------------------------------ //

// ----------------------------- shedule Button ----------------------------------//
meetingModulePopupElements.createMeetingSubmitButton().addEventListener("click", () => {
    let participants = [];
    if (ParticipantsEmail.length > 0) {
        ParticipantsEmail.forEach(ele => {
            participants.push({ "email": ele })
        })
    }
    if (meetingModulePopupElements.meetingTopic().value !== "") {
        let obj = {
            "session": {
                "topic": `${meetingModulePopupElements.meetingTopic().value}`,
                "agenda": `${meetingModulePopupElements.meetingAgenda().value}`,
                "presenter": 123456789,
                "startTime": `${meetingModulePopupElements.meetingDate().value} ${getTimeWithAMPM(meetingModulePopupElements.meetingTime().value)}`,
                "duration": 3600000,
                "timezone": "Asia/Calcutta",
                "participants": participants
            }
        }
    } else {
        alert("Fill the Required Fields");
    }
})

// --------------------------- end Schedule Button ---------------------------//