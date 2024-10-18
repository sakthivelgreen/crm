import { getParams, timeOptions, dateFormat, dateOptions, back } from "../commonFunctions.js";
import { duration, participantEvents, handleMeetingObj } from "./meetingModule.js";
import REST from "../rest.js";
import { meetingModuleElements } from "../declarations.js";


// Close || Back || Cancel 
back(meetingModuleElements.closeMeetingCreateFormButton());

// Get Meeting Id
const Params = getParams(window.location.search);

// Get Meeting
const MeetingApi = new REST('/meetings');
MeetingApi.getByID(Params.id)
    .then((data) => {
        mainFunction(data.session);
    })

function mainFunction(data) {
    participantEvents();
    duration();
    setTime(data);
    setDate(data);
    setMeetingValues(data);
    EditMeetingSave();
}

const setTime = (obj) => {
    timeOptions.hour12 = false;
    const time = dateFormat(obj.startTimeMillisec, timeOptions)
    meetingModuleElements.meetingTime().value = time;
}

const setDate = (obj) => {
    const date = dateFormat(obj.startTimeMillisec, dateOptions)
    meetingModuleElements.meetingDate().value = date;
}

const setMeetingValues = (obj) => {
    meetingModuleElements.meetingTopic().value = obj.topic;
    meetingModuleElements.meetingAgenda().value = obj.agenda;
}

const EditMeetingSave = () => {
    meetingModuleElements.EditMeetingSubmitButton().addEventListener('click', (e) => {
        e.stopPropagation();
        const obj = handleMeetingObj();
        handle_API_Operation(Params.id, obj);
    })
}


flatpickr(meetingModuleElements.meetingDate(), {
    minDate: "today",
    dateFormat: "M d, Y"
})

function handle_API_Operation(id, obj) {
    MeetingApi.put(id, obj)
        .then(() => {
            alert("Edit Successful")
        })
        .then(() => {
            window.open(document.referrer, '_self');
        })
        .catch(e => console.error(e))

}