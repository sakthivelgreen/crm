export default class rightPopUp extends HTMLElement {
    htmlObject;

    constructor(obj = '') {
        super();
        this.htmlObject = obj;
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['data-html'];
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <div class="outerContainer">
                <span id="close"></span>
                <div class="innerContainer">
                    ${this.htmlObject}
                </div>
            </div>
            ${this.style()}
        `;

        // Trigger slide-in effect
        const container = this.shadowRoot.querySelector('.outerContainer');
        requestAnimationFrame(() => {
            container.classList.add('active');
        });

        // Close the popup on click
        this.shadowRoot.querySelector('#close').addEventListener('click', (e) => {
            const container = e.target.closest('.outerContainer');
            const closeBtn = e.target;

            // Slide out and hide close button
            container.classList.add('closing');
            closeBtn.classList.add('hidden');

            // After the transition, remove from DOM
            container.addEventListener('transitionend', () => {
                this.remove();
            });
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && name === 'data-html') {
            this.content = newValue;
        }
    }

    get content() {
        return this.htmlObject;
    }
    set content(value) {
        this.htmlObject = value;
        this.render();
    }

    style() {
        return `
        <style>
               .innerContainer:has(div[width > 300px]) {
                    width: auto !important;
                }

            .outerContainer {
                position: relative;
                height: 100%;
                width: 400px;
                background: #fff;
                box-shadow: 0px 0px 5px rgba(0, 0, 0, 1);
                transform: translateX(100%); /* Start offscreen */
                transition: transform 0.5s ease-in-out;
                overflow: auto;
            }

            .innerContainer{
                margin-top: 70px;
                position: absolute;
                top: 0;
                left: 0;
                padding: 15px;
                }

            /* Slide in effect */
            .outerContainer.active {
                transform: translateX(0); /* Slide in */
            }

            /* Slide out effect */
            .outerContainer.closing {
                transform: translateX(100%); /* Slide out */
            }

            #close {
                position: absolute;
                top: 0;
                left:0;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                z-index: 1000;
            }
            
            #close::before {
                content: '\\2715'; 
                position: absolute;
                margin: 0;
                padding: 10px;
                border-radius: 25%;
                cursor: pointer;
                font-size: 18px;
                color: #111;
            }
            #close:hover::before{
                color: red;
                font-weight: bold;
            }
            #close.hidden {
                opacity: 0; /* Hide the close button */
            }
        </style>
        `;
    }
}

customElements.define('right-popup', rightPopUp);
