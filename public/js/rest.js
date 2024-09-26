export default class REST {
    constructor(url) {
        this.url = url;
    }
    /**
     * For Get Resquest
     * async method
     */
    async get(id = null) {
        try {
            let url = this.url;
            if (id !== null) {
                url += `/${id}`;
            }
            let response = await fetch(this.url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) throw new Error(`Error Getting Data from URL: ${this.url}, ${response.statusText}`);

            let result = await response.json();
            return result;
        } catch (error) {
            console.error('Fetch error:', error); // Log the error for debugging
            throw new Error(`Error: ${error.message}`); // Preserve the original message
        }
    }
    async delete(id) {
        try {
            let response = await fetch(this.url + `/${id}`, {
                method: "Delete",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (!response.ok) throw new Error(`Error Getting Data in url:${this.url}, ${response.statusText}`);
            let result = await response.json();
            return result;
        } catch (error) {
            throw new Error(`Error: ${error}`);

        }
    }
    async put(id, data) {
        try {
            let response = await fetch(this.url + `/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            if (!response.ok) throw new Error(`Error Getting Data in url:${this.url}, ${response.statusText}`);
            let result = await response.json();
            return result;
        } catch (error) {
            throw new Error(`Error: ${error}`);

        }
    }
    async post(data) {
        try {
            let response = await fetch(this.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            if (!response.ok) throw new Error(`Error Getting Data in url:${this.url}, ${response.statusText}`);
            let result = await response.json();
            return result;
        } catch (error) {
            throw new Error(`Error: ${error}`);

        }
    }
}
