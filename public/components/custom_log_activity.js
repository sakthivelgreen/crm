export class OpenActivities extends HTMLElement {
    record_id;
    record_module;
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['record-id', 'record-module'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'record-id') {
            this.recordID = JSON.parse(newValue);
        }
        if (oldValue !== newValue && name === 'record-module') {
            this.recordModule = JSON.parse(newValue);
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


        const style = document.createElement('style');
        style.textContent = this.style();
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(wrapper);
    }
    style() {
        return `
            *{
                box-sizing:border-box;
                margin:0;
                padding:0;    
            }
            .wrapper{
                position: relative;
                height:100%;
                width:100%;
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