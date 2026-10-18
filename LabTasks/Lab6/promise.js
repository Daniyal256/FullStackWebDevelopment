async function getUser() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");

        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }

        const user = await response.json();

        if (!user.id || !user.name || !user.email) {
            throw new Error("Invalid user data");
        }

        return user;

    } catch (error) {
        throw new Error(error.message);
    }
}

getUser()
    .then(user => console.log("Success:", user))
    .catch(error => console.log("Error:", error.message));