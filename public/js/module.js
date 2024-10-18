const filterContainer = document.querySelector("#filterContainer");
const leadListContainer = document.querySelector("#leadListContainer");
const filterBtn = document.querySelector("#filter");
let flag = false;

filterBtn.addEventListener("click", () => {
    if (!flag) {
        let nodes = filterContainer.querySelector("ul");
        nodes.style.display = "none";
        filterContainer.style.width = "0%";
        setTimeout(() => {
            filterContainer.style.display = "none";
        }, 300);
        filterBtn.classList.remove("active");
        flag = !flag;

    } else {
        let nodes = filterContainer.querySelector("ul");
        filterContainer.style.display = "block";
        setTimeout(() => {
            filterContainer.style.width = "30%";
            setTimeout(() => {
                nodes.style.display = "block";
            }, 300)
        }, 1);
        filterBtn.classList.add("active");
        flag = !flag;
    }
})

const optionBtn = document.querySelector(".options");
optionBtn.onfocus = () => {
    let menu = document.getElementById("dropDown1");
    menu.style.display = "block";
}
optionBtn.onblur = () => {
    setTimeout(() => {
        let menu = document.getElementById("dropDown1");
        menu.style.display = "none";
    }, 100)
}

const optionsSpecific = document.querySelector(".optionsSpecific");
optionsSpecific.onfocus = () => {
    let menu = document.getElementById("dropDown2");
    menu.style.display = "block";
}
optionsSpecific.onblur = () => {
    setTimeout(() => {
        let menu = document.getElementById("dropDown2");
        menu.style.display = "none";
    }, 300)
}
