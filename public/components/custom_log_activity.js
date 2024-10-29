export class OpenActivities extends HTMLElement {
    record_id;
    record_module;
    meeting_object;
    task_object;
    call_object;
    title;
    constructor(id = "", module = "", task = "", meeting = "", call = "") {
        super();
        this.task_object = task;
        this.record_id = id;
        this.record_module = module;
        this.meeting_object = meeting;
        this.call_object = call;
        this.title = "Open Activity";
    }

    static get observedAttributes() {
        return ['record-id', 'record-module'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'record-id') {
            this.recordID = newValue;
        }
        if (oldValue !== newValue && name === 'record-module') {
            this.recordModule = newValue;
        }
    }
    set recordID(value) {
        this.record_id = value;
    }
    get recordID() {
        return this.record_id;
    }
    set recordModule(value) {
        this.record_module = value;
    }
    get recordModule() {
        return this.record_module;
    }

    render() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('div');
        wrapper.className = 'wrapper';

        const innerDiv = this.content()

        const style = document.createElement('style');
        style.textContent = this.style();
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(wrapper);

        wrapper.appendChild(innerDiv);
    }

    content() {
        const div = document.createElement('div');
        div.className = 'container';
        const headerBar = this.headerBar();

        const contentBlock = this.contentBlock();
        // contentBlock.className = 'content-block';

        div.appendChild(headerBar);
        div.appendChild(contentBlock);
        return div;
    }

    headerBar() {
        const headerBar = document.createElement('div');
        headerBar.className = 'header-bar';
        const divLeft = document.createElement('div');
        const divRight = document.createElement('div');

        divLeft.className = "header-left";
        divRight.className = "header-right";

        headerBar.appendChild(divLeft);
        headerBar.appendChild(divRight);

        const title = document.createElement('span');
        title.textContent = this.title;

        divLeft.appendChild(title);

        const select = document.createElement('select');
        const AddButton = document.createElement('button');

        AddButton.id = 'createActivity';
        AddButton.textContent = 'Add New';

        const divClearFix = document.createElement('div');
        divClearFix.appendChild(AddButton);
        divClearFix.className = 'addNewBtnFix';

        divRight.appendChild(divClearFix);
        divRight.appendChild(select);

        if (!this.call_object && !this.meeting_object && !this.task_object) {
            headerBar.classList.add('empty');
            select.style.display = 'none';
        }
        return headerBar;
    }
    contentBlock() {
        const div = document.createElement('div');
        return div;
    }

    style() {
        return `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            *{
                box-sizing:border-box;
                margin:0;
                padding:0;  
                font-family: "Poppins", sans-serif;  
            }
            .wrapper{
                height: min-content;
                min-width: 768px;
                width: 100%;
                max-height:400px;
            }
            .container{
                min-height:100px; 
                width: 100%;
            }
            .header-bar{
                display:flex;
                flex-direction: row;
                height:40px;
                padding: 0px 15px;
                border-bottom: 1px solid #afafaf;
            }
            .header-left,
            .header-right{
                display: flex;
                align-items: center;
            }
            .header-left span{
                font-weight: 600;
            }
            .header-right{
                flex: 1 0 auto;
                justify-content: flex-end;
            }

            .addNewBtnFix{
                padding: 5px 20px;
                padding-left: 10px;
                border: 1px solid #CF1FFF;
                min-width: min-content;
                min-height: min-content;
                color: #CF1FFF;
            }
            .addNewBtnFix:hover{
                cursor:pointer;
                color: #fff;
                background: #CF3FFF;
                border-color: #CF3FFF;
                border-radius: 5px;
                }
            #createActivity{
                all: unset;
                font-size: 14px;
                position: relative;
            }
            #createActivity::after{
            content: "\u25B6"; 
            padding-left: 5px; 
            font-size: 10px;
            transform: rotate(45deg); 
            position: absolute; 
            left: 100%; 
            top: 45%; 
            transform: translateY(-50%) rotate(90deg);
            }
        `;
    }
}
customElements.define('open-activities', OpenActivities);

export class ClosedActivities extends OpenActivities {
    constructor() {
        super();
    }
    connectedCallback() {
        console.log(this.name);
    }
}
customElements.define('closed-activities', ClosedActivities);