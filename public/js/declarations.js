export const forms = {
    meetingName: document.querySelector("#meetingTopic"),
    meetingKey: document.querySelector("#meetingKey"),
    meetingDueDate: document.querySelector("#meetingDate"),
    meetingCreateForm: () => document.querySelector("#meetingCreateForm")
}

export const buttons = {
    meetingCancelButton: document.querySelector("#meetingCancelButton"),
    meetingRescheduleButton: document.querySelector("#meetingRescheduleButton"),
    meetingStartButton: () => document.querySelector("#meetingStartButton"),
    meetingJoinButton: document.querySelector("#meetingJoinButton"),
    meetingCreateButton: document.querySelector("#createMeetingButton"),
    meetingCreateSubmitButton: document.querySelector("#createMeetingSubmitButton"),
}

export const anchorTags = {
    upcomingMeetingsNav: document.querySelector("#upcomingMeetings"),
    completedMeetingsNav: document.querySelector("#completedMeetings"),
    pastMeetingNotes: () => document.querySelector("#pastMeetingNotes"),
    pastMeetingChats: () => document.querySelector("#pastMeetingChats")
}

export const divElements = {
    upcomingMeetingsDiv: document.querySelector("#upcomingMeetingList"),
    upcomingMeetingsDiv: document.querySelector("#upcomingMeetingsDiv"),
    meetingsToday: document.querySelector("#meetingsToday"),
    meetingsTomorrow: document.querySelector("#meetingsTomorrow"),
    meetingsThisMonth: document.querySelector("#meetingsThisMonth"),
    meetingsThisWeek: document.querySelector("#meetingsThisWeek"),
    meetingsLater: document.querySelector("#meetingsLater"),
    meetingsLastWeek: document.querySelector("#meetingsLastWeek"),
    meetingsYesterday: document.querySelector("#meetingsYesterday")
}

export const ulElements = {
}

export const popupElements = {
    meetingCreatePopupDiv: document.querySelector("#meetingCreatePopup"),
}

export const meetingModulePopupElements = {
    meetingTopic: () => document.querySelector("#meetingTopic"),
    meetingAgenda: () => document.querySelector("#meetingAgenda"),
    meetingDate: () => document.querySelector("#meetingDate"),
    meetingTime: () => document.querySelector("#meetingTime"),
    meetingDurationHours: () => document.querySelector("#meetingDurationHours"),
    meetingDurationMinutes: () => document.querySelector("#meetingDurationMinutes"),
    meetingParticipants: () => document.querySelector("#meetingParticipants"),
    addParticipants: () => document.querySelector("#addParticipants"),
    participantsList: () => document.querySelector("#participantsList"),
    meetingParticipants: () => document.querySelector("#meetingParticipants"),
    createMeetingSubmitButton: () => document.getElementById("createMeetingSubmitButton"),
    closeMeetingCreateFormButton: () => document.getElementById("closeMeetingCreateFormButton"),
}