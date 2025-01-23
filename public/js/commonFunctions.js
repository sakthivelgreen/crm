import customList from "/components/custom_listview.js";
import REST from './rest.js';
import { Sections } from './declarations.js';
import { LeadMap, OrgMap, ContactMap, DealMap } from '../mappings/keyMap.js';

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
export function trackChanges(Current, Original) {
    const modified = {};
    for (const key in Original) {
        if (Original.hasOwnProperty(key) && key !== '_id') {
            if (typeof Original[key] === 'object' && !Array.isArray(Original[key])) {
                const nested = trackChanges(Current[key], Original[key])
                if (Object.keys(nested).length > 0) modified[key] = nested;
            } else if (Original[key] !== Current[key]) {
                modified[key] = Current[key];
            }
        }
    }
    return modified;
}
export function getRandomColor() {
    const r = Math.floor(Math.random() * 256);  // Random red value (0-255)
    const g = Math.floor(Math.random() * 256);  // Random green value (0-255)
    const b = Math.floor(Math.random() * 256);  // Random blue value (0-255)
    return `rgb(${r}, ${g}, ${b})`;
}

export function option_fragment(arr, key) {
    let fragment = document.createDocumentFragment();
    arr.forEach(item => {
        if (item[key]) {
            let option = document.createElement('option');
            option.value = item[key];
            option.id = item._id;
            option.textContent = item[key].charAt(0).toUpperCase() + item[key].slice(1).toLowerCase();
            fragment.appendChild(option);
        }
    });
    return fragment;
}
export function option_fragment_array(arr) {
    let fragment = document.createDocumentFragment();
    arr.forEach(item => {
        let option = document.createElement('option');
        option.value = item;
        option.id = item;
        option.textContent = item.charAt(0).toUpperCase() + item.slice(1);
        fragment.appendChild(option);
    });
    return fragment;
}

export function table_fragment(head, body) {
    const fragment = document.createDocumentFragment();
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    fragment.appendChild(thead);
    fragment.appendChild(tbody);
    thead.appendChild(table_head(head));
    tbody.appendChild(table_body(head, body));
    return fragment;
}

export function table_head(table_headers) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th><input type="checkbox" id="checkAll" class='checkBox' /></th>`;
    for (const item of table_headers) {
        tr.innerHTML += `<th class='${item}'>${item}</th>`;
    }
    return tr;
}

export function table_body(table_headers, data) {
    const fragment = document.createDocumentFragment();
    if (data.length == 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class='no-data' colspan="${table_headers.length + 1}"><span>No Items to Display</span></td>`;
        fragment.appendChild(tr);
    }
    for (const key of data) {
        if (data.length > 0) {
            const tr = document.createElement('tr');
            tr.id = key._id;

            // Create and append the checkbox as the first cell in the row
            const checkBoxTd = document.createElement('td');
            checkBoxTd.innerHTML = `<input type="checkbox" id="${key._id}" class="checkBox" />`;
            tr.appendChild(checkBoxTd); // Add checkbox td to the row

            // Loop through the headers to append table data cells
            table_headers.forEach(item => {
                if (typeof LeadMap[item] === 'function') {
                    const td = document.createElement('td');
                    td.className = item;
                    td.innerHTML = `<span id="${key._id}" class="${item}">${LeadMap[item](key)}</span>`;
                    tr.appendChild(td);
                } else if (typeof OrgMap[item] === 'function') {
                    const td = document.createElement('td');
                    td.className = item;
                    td.innerHTML = `<span id="${key._id}" class="${item}">${OrgMap[item](key)}</span>`;
                    tr.appendChild(td);
                } else if (typeof ContactMap[item] === 'function') {
                    const td = document.createElement('td');
                    td.className = item;
                    td.innerHTML = `<span id="${key._id}" class="${item}">${ContactMap[item](key)}</span>`;
                    tr.appendChild(td);
                } else if (typeof DealMap[item] === 'function') {
                    const td = document.createElement('td');
                    td.className = item;
                    td.innerHTML = `<span id="${key._id}" class="${item}">${DealMap[item](key)}</span>`;
                    tr.appendChild(td);
                } else {
                    const td = document.createElement('td');
                    td.className = item;
                    td.innerHTML = `<span id="${key._id}" class="${item}">-</span>`;
                    tr.appendChild(td);
                }
            });
            // Append the row to the document fragment
            fragment.appendChild(tr);
        }

    }
    // Return the fragment
    return fragment;
}

export async function Delete_Record(module, id) {
    try {
        let response = await fetch(`/mongodb/${module}/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
        if (!response.ok) throw new Error(response.statusText);
        return await response.json();
    } catch (error) {
        alert("Error in deletion " + error)
        throw new Error("error", error);
    }
}

export async function PostData(data) {
    try {
        const response = await fetch("/mongodb/leads", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error(response.statusText);
        let result = await response.json();
        return result.id;
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to add lead. Please try again.")
    }
}

export async function CreateAccount(data) {
    try {
        const response = await fetch("/mongodb/accounts", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error(response.statusText);
        let result = await response.json();
        return result.id;
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to Create Account. Please try again.")
    }
}
export async function UpdateAccount(id, data) {
    if (data['_id']) delete data['_id'];
    try {
        const response = await fetch("/mongodb/accounts/" + id, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        if (!response.ok) throw new Error(response.statusText);
        let result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error:', error);
        alert("Failed to Update Account. Please try again.")
    }
}