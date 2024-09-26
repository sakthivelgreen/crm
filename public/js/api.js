// Fetch GET request
btn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        let response = await fetch("/api/zoho/sessions");
        if (!response.ok) throw new Error(response.statusText);
        let result = await response.json();
        console.log('GET Response:', result);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

// // Fetch POST request
// btnPost.addEventListener("click", async (e) => {
//     e.preventDefault();
//     try {
//         let response = await fetch("/api/zoho/sessions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ key: "value" }) // Replace with actual data
//         });
//         if (!response.ok) throw new Error(response.statusText);
//         let result = await response.json();
//         console.log('POST Response:', result);
//     } catch (error) {
//         console.error('Error posting data:', error);
//     }
// });

// // Fetch PUT request
// btnPut.addEventListener("click", async (e) => {
//     e.preventDefault();
//     try {
//         let response = await fetch("/api/zoho/sessions/123", { // Replace 123 with actual ID
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ key: "updatedValue" }) // Replace with actual data
//         });
//         if (!response.ok) throw new Error(response.statusText);
//         let result = await response.json();
//         console.log('PUT Response:', result);
//     } catch (error) {
//         console.error('Error updating data:', error);
//     }
// });

// // Fetch DELETE request
// btnDelete.addEventListener("click", async (e) => {
//     e.preventDefault();
//     try {
//         let response = await fetch("/api/zoho/sessions/123", { // Replace 123 with actual ID
//             method: "DELETE"
//         });
//         if (!response.ok) throw new Error(response.statusText);
//         let result = await response.json();
//         console.log('DELETE Response:', result);
//     } catch (error) {
//         console.error('Error deleting data:', error);
//     }
// });
