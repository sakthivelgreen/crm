class customTitle extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: "open" })
        const outerDiv = divFunction("outerDiv", "outerDiv");
        const backSpan = this.spanFunction("backSpan", "goBack")
        const img = document.createElement("img");
        img.src = `../static/back.svg`;
        backSpan.appendChild(img);

        backSpan.addEventListener("click", () => {
            window.history.back();
        })
    }

    divFunction(CLASS, ID) {
        const div = document.createElement("div");
        div.className = CLASS;
        div.id = ID;
        return div;
    }
    spanFunction(CLASS, ID) {
        const span = document.createElement("span");
        span.className = CLASS;
        span.id = ID;
        return span;
    }
}
customElements.define("custom-title", customTitle);