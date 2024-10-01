export const currDate = new Date();
export let timeOptions = {
    hour: '2-digit',
    minute: 'numeric',
    hour12: true
}
export let dateOptions = {
    day: "numeric",
    month: "short",
    year: "numeric"
}

export const dateFormat = (date, options, locale = 'en-US') => {
    let dateFormat = new Intl.DateTimeFormat(locale, options);
    return dateFormat.format(date);
}


export const getTimeWithAMPM = (time) => {
    let [hour, minute] = time.split(':');
    let date1 = new Date();
    date1.setHours(hour);
    date1.setMinutes(minute);
    console.log(date1);
    let timeFormatted = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: 'numeric',
        hour12: true
    });
    return timeFormatted.format(date1);
}