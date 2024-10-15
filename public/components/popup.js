export class PopUp extends HTMLElement {
    #message;
    #success;
    #color;

    constructor(message = '', success = 'OK', color = 'lightgreen') {
        super();
        this.#message = message;
        this.#success = success;
        this.#color = color;
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: "open" });

        // Create the dialog
        const popup = document.createElement('dialog');
        popup.id = 'dialog';

        // Create message text
        const Message = document.createElement('p');
        Message.textContent = this.#message;

        // Create OK button
        const OkButton = document.createElement("button");
        OkButton.id = "success";
        OkButton.textContent = `${this.#success}`;
        OkButton.style.marginRight = '10px';

        // Create Cancel button
        const cancelButton = document.createElement("button");
        cancelButton.id = "cancel";
        cancelButton.textContent = `Cancel`;

        // Buttons Container
        const divBtn = document.createElement("div");
        divBtn.id = "btnContainer";

        // style
        const style = document.createElement("style");
        style.textContent = `

        #btnContainer{
            display: flex;
            justify-content: center;
        }

        #dialog{
        padding:20px;
        width: auto; 
        max-width: 300px;
        background:#fff;
        border:0px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        height: auto;
        max-height: 100px;
        display:flex;
        flex-direction:column;
        align-items: center;
        }

        #success{
        all:unset;
        padding: 5px 15px;
        cursor:pointer;
        border-radius:10px;
        color:${this.#color};
        background-color:#fff;
        border: 1px solid ${this.#color};
        &:hover{
        color:#fff;
        background-color:${this.#color};
        }}

        #cancel{
        all:unset;
        padding: 5px 15px;
        cursor:pointer;
        border-radius:10px;
        color: #000;
        background-color:#D3D3D3;
        border: 1px solid #D3D3D3;
        &:hover{
        background-color:#A9A9A9;
        }
        }

        `;

        // Append elements to the shadow DOM
        shadowRoot.appendChild(popup);
        shadowRoot.appendChild(style);

        popup.appendChild(Message);
        popup.appendChild(divBtn);
        divBtn.appendChild(OkButton);
        divBtn.appendChild(cancelButton);

        // Show the dialog
        popup.showModal();

        this.confirmationPromise = new Promise((resolve) => {
            OkButton.addEventListener('click', () => {
                resolve(true);
                popup.close();
            });

            cancelButton.addEventListener('click', () => {
                resolve(false);
                popup.close();
            });
            const closeOnEscape = (event) => {
                if (event.key === "Escape") {
                    resolve(false);
                    popup.close();
                    this.remove(); // Remove the popup from DOM
                    document.removeEventListener('keydown', closeOnEscape); // Cleanup the event listener
                }
            };
            document.addEventListener('keydown', closeOnEscape);
        });


    }


    confirm() {
        return this.confirmationPromise;
    }

    set message(value) {
        this.#message = value;
    }

    set success(value) {
        this.#success = value;
    }

    set color(value) {
        this.#color = value;
    }
}

// Define the custom element
customElements.define('popup-dialog', PopUp);
