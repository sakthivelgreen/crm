class NavBar extends HTMLElement {
    constructor() {
        super();
    }
    // static get observedAttributes() {
    //     return ['data-name'];          // No Attributes for now!
    // }
    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        let navElements = {
            Home: `/`,
            Leads: `/templates/leads.html`,
            Contacts: `/templates/contacts.html`,
            Accounts: `/templates/accounts.html`,
            Deals: `/templates/deals.html`,
            Meetings: `/templates/meetings/home.html`,
            EMail: `/templates/email/mail.html`
        }
        const navElement = document.createElement('nav');
        const navLeft = document.createElement('div');
        navLeft.className = "navLeft";
        const navRight = document.createElement('div');
        navRight.className = "navRight";
        const unOrderedList = document.createElement('ul');

        const logo = document.createElement('img');
        logo.src = '/static/crm_logo.svg';

        const ProductName = document.createTextNode('CRM');

        const logoBox = document.createElement("span");
        logoBox.className = `logoBox`;
        logoBox.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open('/', '_self');
        })

        logoBox.appendChild(logo);
        logoBox.appendChild(ProductName);
        unOrderedList.appendChild(logoBox);

        for (const element in navElements) {
            const li = document.createElement('li');
            li.id = element;
            li.textContent = element;
            unOrderedList.appendChild(li);
        }

        unOrderedList.addEventListener('click', async (event) => {
            event.stopPropagation();
            if (event.target.tagName === "LI") {
                const link = event.target.id;
                await event.target.classList.add('active');
                window.open(`${navElements[link]}`, '_self');
            }
        })

        shadowRoot.appendChild(navElement);
        shadowRoot.appendChild(this.style());
        navElement.appendChild(navLeft);
        navElement.appendChild(navRight);

        navLeft.appendChild(unOrderedList);
        this.navigation(navElements);
    }


    disconnectedCallback() {
        console.log("Element Removed");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            console.log(`attribute Changed from ${oldValue} to ${newValue}`);
        }
    }

    navigation(navElements) {
        const path = window.location.pathname;
        if (path === '/' || path === '') {
            this.shadowRoot.querySelector('#Home').classList.add('active');
        } else {
            let pathItems = path.split('/').filter(Boolean).slice(1);
            pathItems = pathItems[0].split('.');
            for (const key in navElements) {
                let val = key.toLocaleLowerCase();
                if (val === pathItems[0]) {
                    this.shadowRoot.querySelector(`#${key}`).classList.add('active');
                }
            }
        }
    }

    style() {
        const style = document.createElement('style');
        style.textContent = `
        nav{
            background:#313949;
            margin:0;
            padding: 0px 10px;
            height: 3.5em;
            display:flex;
        }
        .navLeft{
            position:relative;
            width:60%;
            flex: 1 0 auto;
            height:100%;
        }
        .navRight{
            position:relative;
            flex: 1 1 1%;
            height:100%;
        }
        .navLeft ul{
            color:#fff;
            position: relative;
            margin:0;
            padding:0;
            height:100%;
            width:100%;
            display:flex;
            gap:5px;
        }
        .navLeft ul li{
            cursor:pointer;
            position:relative;
            padding:5px;
            margin:0;
            list-style-type:none;
            display:flex;
            align-items:center;
        }
        .navLeft ul li:hover::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 0;
            width: 100%;
            border-bottom: 2px solid #fff;
        }
        .active::after{
        content: '';
            position: absolute;
            bottom: 2px;
            left: 0;
            width: 100%;
            border-bottom: 2px solid #fff;
        }
        .logoBox{
         cursor:pointer;
            position:relative;
            margin:0;
            padding:10px;
            display:flex;
            align-items:center;
            gap:5px;
            font-size:18px;
        }
        `;
        return style;
    }

}
customElements.define("navbar-element", NavBar);

export default NavBar;