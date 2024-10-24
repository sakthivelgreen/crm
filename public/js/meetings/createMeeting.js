import { meetingModuleElements } from "../declarations.js";
import { back, getParams } from "../commonFunctions.js";
import REST from "../rest.js";
import { keyMap } from '../../mappings/keyMap.js';
import { participantEvents, scheduleEvents, duration, setDate, setDuration, setTime, setMeetingValues, setParticipants, listParticipants } from "./meetingModule.js";

// Get ID
const params = getParams(window.location.search);

if (params.hasOwnProperty('module') && params.hasOwnProperty('id')) {
    let Api = new REST(`/mongodb/${params.module}`);
    Api.getByID(params.id).then((data) => {
        let Email = params.module === 'accounts' ? keyMap.account_Email(data) : keyMap.email(data);
        setParticipants(Email);

    })
} else if (params.id) {
    MeetingApi.getByID(params.id)
        .then((data) => {
            setDate(data.session);
            setDuration(data.session);
            setTime(data.session);
            setMeetingValues(data.session);
        })

}



// ---------------------- Main Function -----------------------//
let MeetingApi = new REST('/meetings');
const createMeeting = async (obj) => {
    try {
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
    listParticipants();
}
MainFunction()


