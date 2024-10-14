import REST from "../rest.js";
import { anchorTags, buttons, meetingModuleElements } from "../declarations.js";
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
    } else {
        meetingModuleElements.meetingCompleted().style.display = "none";
        buttons.meetingStartButton().hidden = false;
        buttons.meetingEditButton().hidden = false;
        back_url = `/templates/meetings/meetings.html`;
    }
    anchorTags.goBack().addEventListener("click", () => {
        window.history.back();
    })
    addResponseDetails(data)
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