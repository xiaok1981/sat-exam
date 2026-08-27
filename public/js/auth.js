// Handle tab switching (Login / Register)
function switchTab(tab) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTabBtn = document.getElementById("loginTabBtn");
    const registerTabBtn = document.getElementById("registerTabBtn");
    const errorDiv = document.getElementById("authError");

    errorDiv.style.display = "none";
    errorDiv.textContent = "";

    if (tab === "login") {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        loginTabBtn.classList.add("active");
        registerTabBtn.classList.remove("active");
    } else {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        loginTabBtn.classList.remove("active");
        registerTabBtn.classList.add("active");
    }
}

// Handle login submit
async function handleLoginSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("loginUsername").value.trim();
    const passwordInput = document.getElementById("loginPassword").value;
    const errorDiv = document.getElementById("authError");

    errorDiv.style.display = "none";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed");
        }

        // Save token and username to localStorage
        localStorage.setItem("sat_token", data.token);
        localStorage.setItem("sat_user", JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = "block";
    }
}

// Handle registration submit
async function handleRegisterSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("registerUsername").value.trim();
    const passwordInput = document.getElementById("registerPassword").value;
    const errorDiv = document.getElementById("authError");

    errorDiv.style.display = "none";

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }

        alert("Registration successful! Please login.");
        
        // Clear input boxes
        document.getElementById("registerForm").reset();
        
        // Auto switch tab back to login
        switchTab("login");
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = "block";
    }
}

// Check if user is already logged in, redirect them to dashboard
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("sat_token")) {
        window.location.href = "dashboard.html";
    }
});
