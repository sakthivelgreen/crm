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
    let timeFormatted = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: 'numeric',
        hour12: true
    });
    return timeFormatted.format(date1);
}

export const inputValidationEmpty = (input) => {
    if (input.value !== "") {
        input.classList.remove('errorInput');
        return false;
    } else {
        input.classList.add('errorInput');
        return true;
    }
}

export const getParams = (url) => {
    return Object.fromEntries(new URLSearchParams(url));
}

export function back(item) {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        let link = document.referrer || window.location.origin;
        window.open(link, '_self');
    })
}
