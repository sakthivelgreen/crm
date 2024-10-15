import { anchorTags, buttons, divElements } from "../declarations.js";
import REST from '../rest.js';
import { currDate } from "../commonFunctions.js";

anchorTags.completedMeetingsNav.parentElement.classList.add('activeLink')
const MeetingAPI = new REST('/meetings');

let Meetings;
MeetingAPI.get().then(Obj => {
    Meetings = Obj.response.session;
    Meetings = Meetings.sort((a, b) => a.startTimeMillisec - b.startTimeMillisec);
}).then(async () => {
    for (const Meeting of Meetings) {
        if ((Meeting.startTimeMillisec + Meeting.duration) < currDate.getTime()) {
            const meetingItem = document.createElement('li');
            meetingItem.id = Meeting.meetingKey;
            meetingItem.className = "meetingListItem";
            meetingItem.innerHTML = await meetingListItemStructure(Meeting);
            switch (Meeting.eventTime) {
                case "Today":
                    divElements.meetingsToday.appendChild(meetingItem)
                    break;
                case "Yesterday":
                    divElements.meetingsYesterday.appendChild(meetingItem)
                    break;
                case "This Week":
                    divElements.meetingsThisWeek.appendChild(meetingItem)
                    break;
                case "Last Week":
                    divElements.meetingsLastWeek.appendChild(meetingItem)
                    break;
                case "This Month":
                    divElements.meetingsThisMonth.appendChild(meetingItem)
                    break;
                case "Later":
                    divElements.meetingsLater.appendChild(meetingItem)
                    break;
                default:
                    console.log(Meeting)
                    break;
            }
            meetingItem.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (e.target.className === "pastMeetingNotes") {
                    console.log("Notes");
                } else if (e.target.className === "pastMeetingChats") {
                    console.log("Chats")
                } else if (e.target.parentElement.className === "meetingOptions") {
                    console.log("hi");
                } else {
                    window.location.href = `/templates/meetings/meetingDetail.html?id=${meetingItem.id}`;
                }
            })
        }
    }
})

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
                <span><a href="#" disabled class="pastMeetingNotes" >Notes</a></span>
                <span><a href= "#" disabled class="pastMeetingChats" >Chats</a></span> 
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

buttons.meetingCreateButton().addEventListener("click", () => {
    window.open("/templates/meetings/createMeetings.html", "_self");
})