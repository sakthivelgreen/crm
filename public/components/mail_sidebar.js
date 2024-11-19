export class mailSidebar extends HTMLElement {
    val;
    constructor() {
        super();
    }
    static get observedAttributes() {
        return ['data-arr']
    }
    async connectedCallback() {
        await this.render();
        this.events();
    }
    async render() {
        const folders = this.val;
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const div = document.createElement('div');
        div.classList.add('wrapper');

        div.innerHTML = this.display(folders);

        const style = document.createElement('style');
        style.textContent = this.style();
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(div);
    }

    display(folders) {
        const div = folders.map(element => {
            return `<div class="folder-item">
                <div class="item" id="${element.folderId}">${element.folderName}</div>
            </div>`
        }).join('');
        return `
        <div class="innerDiv">
            <div id="compose-mail">Compose</div>
            ${div}
        </div>`;
    }
    events() {
        this.shadowRoot.querySelector('.innerDiv').addEventListener('click', (e) => {
            e.preventDefault();
            const itemElement = e.target.closest('.item');

            if (itemElement) {
                // Access the correct element's ID and text content
                const folderId = itemElement.id;
                const folderName = itemElement.textContent;

                this.dispatchEvent(new CustomEvent('mail-event', {
                    detail: { folderId, folderName },
                    bubbles: true,
                    composed: true
                }));
            }
        })
        this.shadowRoot.querySelector('#compose-mail').addEventListener('click', (e) => {
            this.dispatchEvent(new CustomEvent('compose-btn', {
                detail: { 'compose': true },
                bubbles: true,
                composed: true
            }))
        })
    }

    attributesChangedCallback(name, oldVale, newValue) {
        if (oldVale != newValue && name === 'data-arr') {
            this.value = newValue;
        }
    }

    style() {
        return `
        *{
            box-sizing: border-box;
            margin:0;
            padding:0;
            font-size:14px;
        }
        .wrapper{
            position: relative;
            min-height: 100%;
            min-width: 15em;
            width: 15em;
            background-color: rgba(45, 50, 60,0.7);
        }
        .innerDiv{
            display: flex;
            flex-direction: column;
            align-items: left;
            padding: 10px 5px;
        }
            .item,#compose-mail{
                user-select: none;
                width: 100%;
                padding:5px 10px;
                cursor: pointer;
                padding-left: 20px;
                color:#fff;
                border-radius: 5px;
            }
        .item:hover{
            color: #000;
            transition-duration: 0.75s;
            background:rgba(245,245,245,1);
        }
            #compose-mail{
            background: #0000ff
            }
        `;
    }

    get value() {
        return this.val;
    }
    set value(val) {
        this.val = val;
    }
}

customElements.define('mail-sidebar', mailSidebar);