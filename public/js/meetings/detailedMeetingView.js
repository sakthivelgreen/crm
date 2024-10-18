import REST from "../rest.js";
import { anchorTags, buttons, meetingModuleElements, popupElements } from "../declarations.js";
import { PopUp } from "../../components/popup.js";
const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('id');

const MeetingAPI = new REST("/meetings");
MeetingAPI.getByID(meetingId)
    .then((meetingData) => {
        mainFunction(meetingData.session);
    }).catch((e) => {
        throw new Error(e);
    })
const mainFunction = (data) => {
    let back_url;
    document.title = `Meeting: ${data.topic}`;
    meetingModuleElements.meetingTopic().textContent = data.topic;
    if (data.isPastSession) {
        meetingModuleElements.meetingCompleted().style.display = "inline-flex";
        buttons.meetingRepeatButton().hidden = false;
        back_url = `/templates/meetings/pastmeetings.html`;
        anchorTags.goBack().addEventListener("click", () => {
            window.open(back_url, '_self');
        })
    } else {
        meetingModuleElements.meetingCompleted().style.display = "none";
        buttons.meetingStartButton().hidden = false;
        buttons.meetingEditButton().hidden = false;
        back_url = `/templates/meetings/meetings.html`;
        anchorTags.goBack().addEventListener("click", () => {
            window.open(back_url, '_self');
        })
    }
    addResponseDetails(data);
    events(data);
}
function addResponseDetails(obj) {
    meetingModuleElements.meetingDate().textContent = obj.timeFormat;
    meetingModuleElements.meetingRegion().textContent = obj.timezone;
    meetingModuleElements.hostMail().textContent = obj.presenterEmail;
    meetingModuleElements.joinLink().textContent = obj.joinLink;
    meetingModuleElements.reminderCount().textContent = obj.reminderDetails.length;
    meetingModuleElements.meetingKey().textContent = obj.meetingKey;
    meetingModuleElements.meetingPassword().textContent = obj.pwd;
    // for Reminders
    for (const reminder of obj.reminderDetails) {
        let p = document.createElement("p");
        p.textContent = reminder.timeFormat;
        meetingModuleElements.meetingReminderDiv().appendChild(p);
    }
}

function events(obj) {
    buttons.meetingStartButton().addEventListener("click", () => {
        const popup = new PopUp();
        popup.message = `Start Meeting Immediately`;
        popup.success = `Start`;
        popup.color = `blue`;
        document.body.insertBefore(popup, document.body.firstChild);
        popup.confirm().then(ok => {
            if (ok) {
                window.open(obj.startLink, "_blank");
            }
        })
    })
    buttons.meetingCancelButton().addEventListener("click", () => {
        const popup = new PopUp(`Delete ${obj.topic}`, `Delete`, `red`);
        document.body.insertBefore(popup, document.body.firstChild);
        popup.confirm()
            .then((ok) => {
                if (ok) deleteMeeting(obj);
            })
    })
    buttons.meetingRepeatButton().addEventListener('click', () => { window.open(`/templates/meetings/createMeetings.html?id=${meetingId}`) });
    buttons.meetingEditButton().addEventListener('click', () => { window.open(`/templates/meetings/EditMeetings.html?id=${meetingId}`, '_self') });
}

const deleteMeeting = (obj) => {
    MeetingAPI.delete(obj.meetingKey)
        .then(() => {
            window.open(`/templates/meetings/meetings.html`, "_self");
        })
        .catch((e) => {
            console.log(e);
        })
}