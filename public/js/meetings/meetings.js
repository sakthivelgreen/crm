import { anchorTags, buttons, divElements } from "../declarations.js";
import { currDate } from "../commonFunctions.js";

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
    .then(() => { checkData() })
const listMeetings = async () => {
    for (const meeting of meetingsObj) {
        if ((Date.now() - (meeting.startTimeMillisec + meeting.duration)) < 0) {
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
                case "Later":
                    divElements.meetingsLater.appendChild(meetingItem)
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
                    window.location.href = `/templates/meetings/meetingsDetail.html?id=${meetingItem.id}`;
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

function checkData() {
    const upcomingMeetingsDiv = document.querySelector("#upcomingMeetingsDiv");
    // Check if the element exists
    if (upcomingMeetingsDiv) {
        const childNodes = upcomingMeetingsDiv.childNodes;

        // Check if there are child nodes, and whether each child node is empty (i.e., contains no text or other elements)
        const allChildrenEmpty = Array.from(childNodes).every(child => {
            // Check if a node is an element node and if it has no child elements or text
            return child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '' ||
                (child.nodeType === Node.ELEMENT_NODE && !child.hasChildNodes());
        });
        const text = document.createElement('p');
        text.textContent = "No Upcoming Meetings";
        const img = document.createElement("img");
        img.src = '../../static/no-upcoming-meeting.svg';
        if (allChildrenEmpty) {
            divElements.upcomingMeetingsDiv().classList.add("noMeetings")
            divElements.upcomingMeetingsDiv().appendChild(img);
            divElements.upcomingMeetingsDiv().appendChild(text);
        }
    }
}

buttons.meetingCreateButton().addEventListener("click", (e) => {
    window.open('/templates/meetings/createMeetings.html', '_self');
})



