const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('id');
console.log(meetingId);

