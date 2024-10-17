import { meetingModuleElements, forms } from "../declarations.js";
import { getTimeWithAMPM, inputValidationEmpty } from "../commonFunctions.js";
let ParticipantsEmail = [];

export const participantEvents = () => {
    meetingModuleElements.meetingParticipants().addEventListener("focus", () => {
        meetingModuleElements.meetingParticipants().addEventListener("keydown", handleKeydown);
    });
    meetingModuleElements.meetingParticipants().addEventListener("blur", () => {
        meetingModuleElements.meetingParticipants().removeEventListener("keydown", handleKeydown);
    });

    meetingModuleElements.addParticipants().addEventListener("click", (e) => {
        if (meetingModuleElements.meetingParticipants().value !== "" && !ParticipantsEmail.includes(meetingModuleElements.meetingParticipants().value)) {
            meetingModuleElements.meetingParticipants().value = meetingModuleElements.meetingParticipants().value.trim();
            if (meetingModuleElements.meetingParticipants().validity.valid) {
                ParticipantsEmail.push(meetingModuleElements.meetingParticipants().value.trim());
                listParticipants()
                meetingModuleElements.meetingParticipants().value = ""
                meetingModuleElements.meetingParticipants().focus()
            } else {
                alert("invalid Email")
            }
        }
    })
}


export const removeParticipantsEventListener = () => {
    meetingModuleElements.participantsList().addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.tagName == 'I') {
            let li = e.target.parentNode;
            ParticipantsEmail = ParticipantsEmail.filter(ele => ele !== li.firstChild.textContent);
            listParticipants()
        }
    })
}


export function scheduleEvents(createMeeting) {
    meetingModuleElements.createMeetingSubmitButton().addEventListener("click", () => {
        const obj = handleMeetingObj();
        if (obj) createMeeting(obj);
    });

}


export function handleKeydown(e) {
    if (e.key === "Enter" || e.key === ',') {
        meetingModuleElements.addParticipants().click();
        e.preventDefault();
    }
    if (document.activeElement !== meetingModuleElements.meetingParticipants()) {
        meetingModuleElements.addParticipants().click();
        e.preventDefault();
    }
    if (e.code === "Space" && meetingModuleElements.meetingParticipants().value === "") {
        meetingModuleElements.meetingParticipants().value = "";
    }
    if (e.keyCode === 8 && meetingModuleElements.meetingParticipants().value === "") {
        ParticipantsEmail.pop();
        listParticipants()
    }
}


export function listParticipants() {
    removeAllParticipants();
    ParticipantsEmail.forEach(ele => {
        const i = document.createElement("i");
        i.textContent = "\u2716";
        const li = document.createElement("li");
        li.textContent = `${ele}`
        li.appendChild(i)
        meetingModuleElements.participantsList().insertBefore(li, meetingModuleElements.participantsList().lastElementChild);
    })
    removeParticipantsEventListener();
}


export const removeAllParticipants = () => {
    let div = meetingModuleElements.participantsList();
    let li = div.querySelectorAll('li');
    li.forEach(item => {
        item.remove();
    })
}


export function duration() {
    for (let index = 0; index < 24; index++) {
        let options = document.createElement("option");
        options.value = index;
        index = index.toString().padStart(2, '0')
        options.textContent = index;
        meetingModuleElements.meetingDurationHours().appendChild(options);
    }

    [0, 15, 30, 45].map(ele => {
        let options = document.createElement("option");
        options.value = ele;
        ele = ele.toString().padStart(2, '0');
        options.textContent = ele;
        if (ele === "30") options.selected = true;
        meetingModuleElements.meetingDurationMinutes().appendChild(options)
    })
}

export function handleMeetingObj() {
    let participants = [];
    if (ParticipantsEmail.length > 0) {
        ParticipantsEmail.forEach(ele => {
            participants.push({ "email": ele })
        })
    }
    let obj, validity;
    let form = forms.meetingCreateForm();
    let inputs = form.querySelectorAll("input[required]");
    if (meetingModuleElements.meetingDurationHours().value == 0 && meetingModuleElements.meetingDurationMinutes().value == 0) {
        meetingModuleElements.meetingDurationMinutes().value = 30;
    }
    let duration = (meetingModuleElements.meetingDurationHours().value * 60 * 60 * 1000) + (meetingModuleElements.meetingDurationMinutes().value * 60 * 1000)
    inputs.forEach((input) => {
        validity = inputValidationEmpty(input)
        console.log(validity);
    })
    if (!validity) {
        obj = {
            "session": {
                "topic": `${meetingModuleElements.meetingTopic().value}`,
                "agenda": `${meetingModuleElements.meetingAgenda().value}`,
                "presenter": 60030984640,
                "startTime": `${meetingModuleElements.meetingDate().value} ${getTimeWithAMPM(meetingModuleElements.meetingTime().value)}`,
                "duration": `${duration}`,
                "timezone": "Asia/Calcutta"
            }
        }
    } else {
        return false;

    }
    participants.length > 0 ? obj.session.participants = participants : null;
    return obj;
}
