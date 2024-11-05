import { keyMap } from "../mappings/keyMap.js";
export default class customList extends HTMLElement {
    #obj;
    #titlesArray;
    #checkBox;
    #list_Number;
    #redirect_link;
    #titleEnabled;
    constructor(checkBox = false, list_Number = true, array1 = [], array2 = [], link = "", tEnabled = true) {
        super();

        this.#obj = array1;
        this.#titlesArray = array2;
        this.#checkBox = checkBox;
        this.#list_Number = list_Number;
        this.#redirect_link = link;
        this.#titleEnabled = tEnabled;
    }
    static get observedAttributes() {
        return ['data-obj', 'data-titles', 'data-checkBox', 'data-list-number', 'data-redirect-link', 'data-title-enable'];
    }
    connectedCallback() {
        this.render();
        this.events();
    }
    render() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const Obj = this.#obj;

        const wrapper = document.createElement('div');
        wrapper.className = 'OuterDiv';
        const InnerDiv = document.createElement('div');
        InnerDiv.className = 'innerDiv';

        const header = this.header();
        let body = this.body(Obj, InnerDiv);

        const style = document.createElement('style');
        style.textContent = this.style();
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(wrapper);
        wrapper.appendChild(InnerDiv);

        if (this.#titleEnabled) InnerDiv.appendChild(header);
        InnerDiv.appendChild(body);
    }

    header() {
        const row = document.createElement('div');
        row.className = 'headerDiv';
        let headHTML = '';
        headHTML += `
        ${this.#list_Number ? `<div class='count column'>No</div>` : ''}
        `;
        if (this.#checkBox) headHTML += `<div class='column'><input type='checkbox' id='selectAll'></div>`;
        for (const ele of this.#titlesArray) {
            headHTML += `<div class='${ele} column'>${ele.charAt(0).toUpperCase() + ele.slice(1)}</div>`;
        }
        row.innerHTML = headHTML;
        return row;
    }

    body(obj, div) {
        const body = document.createElement('div');
        body.className = 'customBody';
        if (obj.length > 0) {
            let count = 1;
            let bodyContent = '';
            for (const key of obj) {
                bodyContent += `
                <div id="${key._id}" class="rowElement">
                ${this.#list_Number ? `<div class="column count">${count}</div>` : ''}
                 ${this.checkBox ? `<div class='column'> <input class='rowCheckbox' type='checkbox' id='${key._id}'></div>` : ''}
                ${this.#checkBox ? `
                    <div class='checkBox' id='${key._id}'></div>
                    `: ''}
                ${this.#titlesArray.map(item => {
                    let content = keyMap[item] ? keyMap[item](key) : '';
                    return `<div class="column ${item}">${content}</div>`;
                }).join('')}
            </div>
        `;
                count++;
            }
            body.innerHTML = bodyContent;
            return body;
        } else {
            const noDataImg = document.createElement('img');
            noDataImg.src = '/static/no-data5.png';
            div.classList.add('empty');
            body.appendChild(noDataImg);
            return body;
        }

    }

    events() {

        this.shadowRoot.querySelector('.customBody').addEventListener('click', (e) => {
            if (e.target.parentElement.className === 'rowElement') {
                e.preventDefault();
                if (this.#redirect_link !== '') {
                    window.open(`${this.#redirect_link}?id=${e.target.parentElement.id}`, '_self')
                }
            }
        });
        let selectAllBox = this.shadowRoot.querySelector('#selectAll');
        if (selectAllBox) {
            let body = this.shadowRoot.querySelector('.customBody');
            let rowCheckbox = body.querySelectorAll('input[type="checkbox"]')

            const updateCheckBox = (e) => {
                const checkedItems = Array.from(rowCheckbox).filter(item => item.checked);
                selectAllBox.checked = rowCheckbox.length === checkedItems.length;
                selectAllBox.indeterminate = checkedItems.length > 0 && checkedItems.length < rowCheckbox.length;
                if (checkedItems.length > 0) handleClick(checkedItems);
            }
            const handleClick = (checkedItems) => {
                // Create and dispatch a custom event
                let arr = []
                if (checkedItems !== null) {
                    checkedItems.forEach(item => {
                        arr.push(item.id);
                    })
                    console.log(arr);
                }
                const event = new CustomEvent('Checked-Custom', {
                    detail: { array: arr },
                    bubbles: true, // Allows the event to bubble up the DOM
                    composed: true // Allows the event to cross shadow DOM boundaries
                });
                this.dispatchEvent(event);
            }


            selectAllBox.addEventListener('change', (e) => {
                e.preventDefault();
                rowCheckbox.forEach(item => {
                    item.checked = selectAllBox.checked;
                })
                if (selectAllBox.checked) handleClick(rowCheckbox);
                else handleClick(null)
            })
            rowCheckbox.forEach(checkbox => {
                checkbox.addEventListener('change', updateCheckBox);
            });
        }
    }

    style() {
        return `
            .OuterDiv{
                box-sizing: border-box;
                position:relative;
                width:100%;
                height: 100%;  
                padding: 0px 20px;
            }
            .innerDiv{
                position:relative;
                width:100%;
                height: 100%;
                display:flex;
                flex-direction:column;
                background: #efefef;
                border-radius: 5px;
            }
            
            .innerDiv .customBody{
                position: relative;
                ${this.#titleEnabled ? 'margin-top: 50px;' : ''}
                height: calc(100% - 50px);
                max-height: calc(100% - 50px);
                width:100%;
                display:flex;
                flex-direction: column;
                overflow-y: auto;
            }
            .innerDiv.empty .customBody img{
                height:250px;
                opacity:0.5;
                pointer-events:none;
            }
            .innerDiv.empty .customBody{
                position: relative;
                margin-top: 50px;
                min-height:300px;
                width:100%;
                display:flex;
                align-items:center;
                justify-content:center;
            }

            .headerDiv{
                font-weight: bold;
                position: absolute;
                top:0;
                left:0;
                min-width:100%;
                height: 50px;
                background: #cfcfcf;
                display:flex;
                flex-direction:row;
                align-items:center;
                justify-content: space-evenly;
                border-radius: 5px 5px 0px 0px;
            }
            .headerDiv:first-child{
                justify-content: start;
                width:3.5em;
            }
            .rowElement{
                display:flex;
                height: 45px;
                cursor: pointer;
            }
            .rowElement:hover{
                background: #fafafa;
            }

            .column:first-child{
                flex: 0 0 3.5em;
                border-left:0;
            }
            .column:last-child{
                border-right:0;
            }
            .column{
                position:relative;
                flex:1 1 5em;
                flex-wrap: wrap;
                height: 100%;
                display:flex;
                align-items:center;
                justify-content:center;
                border-left: 1px solid #fff;
                border-right: 1px solid #fff;
            }
        `;

    }


    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'data-obj') {
            this.value = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-titles') {
            this.title = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-checkBox') {
            this.checkBox = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-list-number') {
            this.list_Number = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-redirect-link') {
            this.redirect = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-title-enabled') {
            this.tEnabled = newValue;
        }
    }

    set value(val) {
        this.#obj = val;
    }
    get value() {
        return this.#obj;
    }

    set title(val) {
        if (Array.isArray(val)) {
            this.#titlesArray = val;
        }
    }
    get title() {
        return this.#titlesArray;
    }
    set checkBox(val) {
        if (typeof val !== 'boolean') {
            throw new Error("Booleans Only allowed")
        }
        this.#checkBox = val;
    }
    get checkBox() {
        return this.#checkBox;
    }
    set list_Number(val) {
        if (typeof val !== 'boolean') {
            throw new Error("Booleans Only allowed")
        }
        this.#list_Number = val;
    }
    get list_Number() {
        return this.#list_Number;
    }
    set redirect(val) {
        if (val !== '') {
            this.#redirect_link = val;
        }
    }
    get redirect() {
        return this.#redirect_link;
    }
    get tEnabled() {
        return this.#titleEnabled;
    }
    set tEnabled(val) {
        if (val !== '') {
            this.#titleEnabled = val;
        }
    }
}
customElements.define('custom-listview', customList);

export class customMailList extends customList {
    constructor(obj = [], titles = [], link = "") {
        super(true, false, obj, titles, link, true);
    }
    connectedCallback() {
        super.connectedCallback();
    }
    header() {
        const row = document.createElement('div');
        row.className = 'headerDiv';
        let headHtml = '';
        headHtml += `<div class="div1Head">
        <div class='checkBoxDiv'><input type='checkbox' id='selectAll'></div> 
        </div>`;

        row.innerHTML = headHtml;
        return row;
    }
    body(obj, div) {
        const body = document.createElement('div');
        body.className = 'customBody';
        let arr = this.title;
        if (obj.length > 0) {
            let bodyHtml = '';
            console.log(obj);

            obj.forEach(ele => {
                console.log(ele);

                bodyHtml += `<div class='rowElement' id='${ele.messageId}'>`
                bodyHtml += `<div class='checkBoxDiv'><input type='checkbox' id='${ele.messageId}'></div>`;
                bodyHtml += `<div class='column'><p>${ele.fromAddress}</p><p>${ele.subject}</p></div>`;
                bodyHtml += `</div>`;
            });
            body.innerHTML = bodyHtml;
            return body;
        }
        else {
            const noDataImg = document.createElement('img');
            noDataImg.src = '/static/no-data5.png';
            div.classList.add('empty');
            body.appendChild(noDataImg);
            return body;
        }
    }
    style() {
        const parentStyle = super.style();
        const childStyle = `
            .innerDiv{
                background: none;
            }
            .innerDiv.empty .customBody{
                box-shadow: 0px 0px 1px rgba(0,0,0,0.9) inset;
                }
            .div1Head{
                width:100%;
                height: 100%;
            }
            .headerDiv{
                background: rgba(208, 251, 89, 0.21);
            }
            .checkBoxDiv{
                height: 100%;
                width: 3.5em;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            input[type="checkbox"]{
                transform: scale(1.1);
                cursor: pointer;
            }
            .rowElement{
                height: 60px;
            }
            .column{
                flex-direction: column;
                align-items: start;
            }
            p{
                padding:0;
                margin:0;
            }
        `;

        return `${parentStyle} ${childStyle}`;
    }
}
customElements.define('custom-list-mail', customMailList);