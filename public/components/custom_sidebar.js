class customSidebar extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const sidebar = document.createElement('div');
        sidebar.className = "sidebarElement";

        const sideBarElements = {
            Home: '../meetings/home.html',
            Meetings: `../meetings/meetings.html`,
            Webinars: `../meetings/webinars.html`
        }

        const unOrderedList = document.createElement('ul');

        for (const item in sideBarElements) {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const span = document.createElement('span');
            img.src = `/static/${item}.svg`;
            li.id = item;
            span.textContent = item;
            li.appendChild(img);
            li.appendChild(span);
            unOrderedList.appendChild(li);
        }

        unOrderedList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                e.stopPropagation();
                const link = e.target.id;
                window.open(sideBarElements[link], '_self');
            }
            if (e.target.tagName === 'IMG') {
                e.stopPropagation();
                const link = e.target.parentElement.id;
                window.open(sideBarElements[link], '_self');
            }
            if (e.target.tagName === "SPAN") {
                e.stopPropagation();
                const link = e.target.parentElement.id;
                window.open(sideBarElements[link], '_self');
            }
        })


        shadowRoot.appendChild(sidebar);
        shadowRoot.appendChild(this.style());
        sidebar.appendChild(unOrderedList);
        this.navigation(sideBarElements);
    }

    style() {
        const style = document.createElement('style');
        style.textContent = `
        .sidebarElement{
            width: 5em;
            height:100%;
            margin:auto;
            padding:0;
        }
        ul{
            position: relative;
            height:100%;
            width:100%;
            padding:0;
            margin:0;
            display:flex;
            flex-direction: column;
            align-items: center;
        }
        li{
            position: relative;
            width:100%;
            height:75px;
            margin:0;
            list-style-type:none;
            color:#dfdfdf;
            cursor:pointer;
            display:flex;
            flex-direction: column;
            gap:5px;
            align-items:center;
            justify-content:center;
            font-size:14px;
        }
        li:hover{
            background: #101825;
            color:#fff;
        }
        img{
            height:25px;
            width:25px;
        }
        .active{
            color:#fff;
            background: #101825;
        }
        .active::after{
            content:'';
            position: absolute;
            top:0;
            left:0;
            height:100%;
            border-left: 3px solid #90c9ff;
        }
        `;
        return style;
    }

    navigation(nav) {
        let path = window.location.pathname;
        let pathItems = path.split('/').slice(3);
        pathItems = pathItems[0].split('.');

        for (const item in nav) {
            let value = item.toLocaleLowerCase();
            if (value === pathItems[0] || pathItems[0].toLocaleLowerCase().includes(value)) this.shadowRoot.querySelector(`#${item}`).classList.add('active');
        }
    }
    // disconnectedCallback() { }      // Future Usage
    // attributeChangedCallback() { }
}

customElements.define('custom-sidebar', customSidebar)