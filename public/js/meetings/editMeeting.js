import { getParams, back } from "../commonFunctions.js";
import { duration, participantEvents, handleMeetingObj, setDuration, setDate, setTime, setMeetingValues, setParticipants } from "./meetingModule.js";
import REST from "../rest.js";
import { meetingModuleElements } from "../declarations.js";


// Close || Back || Cancel 
back(meetingModuleElements.closeMeetingCreateFormButton());

// Get Meeting Id
const Params = getParams(window.location.search);

let dataFromMongoDB;

const MongoAPI = new REST('/mongodb/meetings');
// Get Meeting
const MeetingApi = new REST('/meetings');
MeetingApi.getByID(Params.id)
    .then((data) => {
        mainFunction(data.session);
    })

async function mainFunction(data) {
    dataFromMongoDB = await mongodb(data)
    participantEvents();
    duration();
    setDuration(data);
    setTime(data);
    setDate(data);
    setMeetingValues(data);
    EditMeetingSave();
    Participants();
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
        .then((data) => {
            storeInMongoDB(data);
        })
        .then(() => {
            alert("Edit Successful")
        })
        .then(() => {
            window.open(document.referrer, '_self');
        })
        .catch(e => console.error(e))

}

async function mongodb(obj) {
    let data = await MongoAPI.get()
    let result = data.find(object => object.session.meetingKey === obj.meetingKey)
    return result ? result : -1;
}
function Participants() {
    if (dataFromMongoDB !== -1) {
        for (const participant of dataFromMongoDB.session.participants) {
            setParticipants(participant.email);
        }
    }


}

async function storeInMongoDB(obj) {
    if (dataFromMongoDB !== -1) {
        try {
            let res = await MongoAPI.put(dataFromMongoDB._id, obj)
            if (res) return;
        } catch (error) {
            console.error(error)
        }
    } else {
        try {
            let res = await MongoAPI.post(obj)
            if (res) return;
        } catch (error) {
            console.error(error)
        }
    }
}