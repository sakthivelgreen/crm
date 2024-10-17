import { meetingModuleElements, forms } from "../declarations.js";
import { getTimeWithAMPM, inputValidationEmpty, back } from "../commonFunctions.js";
import REST from "../rest.js";
import { participantEvents, scheduleEvents, duration } from "./meetingModule.js";

// ---------------------- Main Function -----------------------//
let MeetingApi = new REST('/meetings');
const createMeeting = async (obj) => {
    try {
        console.log(obj);

        MeetingApi.post(obj)
            .then(() => {
                alert('Meeting Created');
            })
            .then(() => {
                window.open('/templates/meetings/meetings.html', '_self');
            })
            .catch((e) => {
                console.log(e)
            })
    } catch (e) {
        throw new Error(`Error: ${e}`);
    }
}

// ---------------------- End Main Function -------------------//
flatpickr(meetingModuleElements.meetingDate(), {
    minDate: "today",
    dateFormat: "M d, Y"
})


const MainFunction = () => {
    back(meetingModuleElements.closeMeetingCreateFormButton());
    duration();
    participantEvents();
    scheduleEvents(createMeeting);
}
MainFunction()
