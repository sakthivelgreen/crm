import { keyMap } from "../mappings/keyMap.js";
export default class customList extends HTMLElement {
    #obj;
    #titlesArray;
    #checkBox;
    #list_Number;
    #redirect_link;
    constructor(checkBox = false, list_Number = true, array1 = [], array2 = [], link = "") {
        super();
        this.#obj = array1;
        this.#titlesArray = array2;
        this.#checkBox = checkBox;
        this.#list_Number = list_Number;
        this.#redirect_link = link;
    }
    static get observedAttributes() {
        return ['data-obj', 'data-titles', 'data-checkBox', 'data-list-number', 'data-redirect-link'];
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

        InnerDiv.appendChild(header);
        InnerDiv.appendChild(body);
    }

    header() {
        const row = document.createElement('div');
        row.className = 'headerDiv';
        const sno = document.createElement('div');
        if (this.#list_Number) {
            sno.textContent = "No";
            sno.className = 'count';
            sno.classList.add('column')
            row.appendChild(sno);
        }

        for (const ele of this.#titlesArray) {
            const column = document.createElement('div');
            column.className = ele;
            column.classList.add('column');
            column.textContent = ele.charAt(0).toUpperCase() + ele.slice(1);
            row.appendChild(column);
        }
        return row;
    }

    body(obj, div) {
        const body = document.createElement('div');
        body.className = 'customBody';
        if (obj.length > 0) {
            let count = 1;
            for (const key of obj) {
                const row = document.createElement('div');
                row.id = key._id;
                row.className = 'rowElement';
                if (this.#list_Number) {
                    let SNo = document.createElement('div');
                    SNo.className = "count";
                    SNo.classList.add('column');
                    SNo.textContent = count;
                    row.appendChild(SNo);
                }
                this.#titlesArray.map((item) => {
                    const column = document.createElement('div');
                    column.className = 'column';
                    column.classList.add(item);
                    if (keyMap[item]) {
                        column.textContent = keyMap[item](key); // Call the appropriate function based on the field
                    }
                    row.appendChild(column);
                })
                body.appendChild(row);
                count++;
            }
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
                margin-top: 50px;
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
                width:100%;
                height: 50px;
                background: #cfcfcf;
                display:flex;
                flex-direction:row;
                align-items:center;
                justify-content: space-evenly;
                border-radius: 5px 5px 0px 0px;
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
            this.#checkBox = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-list-number') {
            this.#list_Number = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'data-redirect-link') {
            this.#redirect_link = JSON.parse(newValue);
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
}
customElements.define('custom-listview', customList);