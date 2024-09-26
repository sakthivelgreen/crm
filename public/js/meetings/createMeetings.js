let createMeetingForm =
    `<form >
        <div class="form-elements-div">
            <label for="meetingTopic">MeetingName</label>
            <input type="text" name="meetingTopic" id="meetingTopic" class="form-elements">
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
            <label for="meetingParticipants">Time</label>
            <input type="email" name="meetingParticipants" id="meetingParticipants" class="form-elements">
            <div class="participants">
            </div>
        </div>
        <button id="createMeetingSubmitButton">Shedule</button>
    </form >`;