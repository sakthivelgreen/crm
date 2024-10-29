import REST from "../js/rest.js";
export class mailSidebar extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const folders = await this.getFolders()
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const div = document.createElement('div');
        div.classList.add('wrapper');

        div.innerHTML = this.display(folders);

        const style = document.createElement('style');
        style.textContent = this.style();

        shadowRoot.appendChild(style);
        shadowRoot.appendChild(div);
    }

    async getFolders() {
        try {
            let Api = new REST('/mail/folders');
            let response = await Api.get();
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    display(folders) {
        const div = folders.map(element => {
            return `<div class="folder-item">
                <div class="item" id="${element.folderId}">${element.folderName}</div>
            </div>`
        }).join('');
        return `<div class="innerDiv"> ${div}</div>`;
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
            .folder-item{
                user-select: none;
                width: 100%;
                padding:5px 10px;
                cursor: pointer;
                padding-left: 20px;
                color:#fff;
                border-radius: 5px;
            }
        .folder-item:hover{
            color: #000;
            transition-duration: 0.75s;
            background:rgba(245,245,245,1);
        }
        .item{
            width:100%;
            height: 100%;
        }
        `;
    }

}

customElements.define('mail-sidebar', mailSidebar);