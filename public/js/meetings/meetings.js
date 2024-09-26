import { anchorTags, buttons, forms, ulElements, divElements } from "../declarations.js";
import REST from "../rest.js";
anchorTags.upcomingMeetingsNav.parentElement.classList.add("activeLink");
let meetingsObj = {};
const getMeetings = async () => {
    try {
        let response = await axios.get(`/meetings`);
        console.log(response.data);
        return response.data
    } catch (error) {
        console.log(error);
    }
}
getMeetings()
    .then(data => meetingsObj = data)
    .then(() => { listMeetings() })

const listMeetings = () => {
    console.log(meetingsObj);
}





