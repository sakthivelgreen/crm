import customList from "/components/custom_listview.js";
import REST from './rest.js';
import { Sections } from './declarations.js';

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

export let date_time = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: '2-digit',
    minute: 'numeric',
    hour12: true
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

export function buttonRedirect(btn, id = "", link, module = "") {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(`${link}?id=${id}&module=${module}`, '_self');
    })
}

export async function zohoMailFolder() {
    try {
        let response = await fetch('/mail/folders');
        let res = await response.json();
        if (response.status === 401) {
            localStorage.setItem('url', window.location.href);
            window.open(res.redirect, '_self');
        }
        return res;
    } catch (error) {
        console.error(error)
    }
}
export async function zohoMail(mid, fid) {
    try {
        let response = await fetch(`/mail/view/message/meta/${mid}/${fid}`);
        if (!response.ok) throw new Error(response.statusText + ' ' + response.status);
        let res = await response.json();
        return res.data;
    } catch (error) {
        console.error(error)
    }
}

export async function processMails(id, module) {
    let list = new customList();
    let mongoEndPoint = new REST('/mongodb/email_logs');
    let mailFolders = await zohoMailFolder();
    const SentFolder = mailFolders.data.filter(item => item.path === '/Sent');
    let Mongo_data = await mongoEndPoint.get();
    Mongo_data = Mongo_data.filter(item => (item.msg === 'Mail Sent') && item.user_details[id] === `${module}`)
    let Mails = await Promise.all(Mongo_data.map(async (item) => await zohoMail(item.msgId, SentFolder[0].folderId)));
    list.value = Mails;
    list.title = ['Subject', 'Date', 'Summary'];
    list.redirect = "#";
    Sections.mailSection().appendChild(list)
}

export async function getData(module) {
    try {
        let response = await fetch(`/mongodb/${module}`);
        if (!response.ok) throw new Error(response.statusText);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error(error);

    }
}

export function getRandomColor() {
    const r = Math.floor(Math.random() * 256);  // Random red value (0-255)
    const g = Math.floor(Math.random() * 256);  // Random green value (0-255)
    const b = Math.floor(Math.random() * 256);  // Random blue value (0-255)
    return `rgb(${r}, ${g}, ${b})`;
}