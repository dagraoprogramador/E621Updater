document.addEventListener("DOMContentLoaded", () => {
    const daterangelocal = document.querySelector("input.date");
    const button = document.querySelector("button.login");
    const usertext = document.querySelector("p.usertext");

    button.addEventListener("click", async () => {
        button.disabled = true;
        const username = document.querySelector("input.pass").value;
        sessionStorage.setItem("username", username);

        try {
            const response = await fetch(`https://updater-backend.vercel.app/api/proxy?url=https://e621.net/users/${username}.json`);
            const data = await response.json();

            if (response.status === 404) {
                usertext.innerHTML = "Username not found";
            } else if (!response.ok) {
                usertext.innerHTML = "Something went wrong :(";
            } else {
                usertext.innerHTML = "";
                sessionStorage.setItem("daterange", daterangelocal.value);
                window.location.replace("./Main.html");
            }
        } catch (error) {
            usertext.innerHTML = "Server error";
        }

        setTimeout(button.disabled = false, 500);
    });
});
