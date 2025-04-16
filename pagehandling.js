document.addEventListener("DOMContentLoaded", () => {
    const daterangelocal = document.querySelector("input.date");
    const usertext = document.querySelector("p.usertext");

    document.querySelector("button.login").addEventListener("click", async () => {
        this.disabled = true;
        const username = document.querySelector("input.pass").value;
        localStorage.setItem("username", username);

        try {
            const response = await fetch(`https://updater-backend.vercel.app/api/proxy?url=https://e621.net/users/${username}.json`);

            if (response.status === 404) {
                usertext.innerHTML = "Username not found";
            } else if (!response.ok) {
                usertext.innerHTML = "Something went wrong :(";
            } else {
                usertext.innerHTML = "";
                localStorage.setItem("daterange", daterangelocal.value);
                window.location.replace("./Main.html");
            }
        } catch (error) {
            usertext.innerHTML = "Server error";
        }

        setTimeout(this.disabled = false, 500);
    });
});
