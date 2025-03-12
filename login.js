import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import { riddles } from "./levels.js"; // ✅ Import riddles to check if level exists

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const result = document.getElementById("result");

    if (!email || !password) {
        result.innerHTML = "<span style='color: red;'>Please enter both email and password.</span>";
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("✅ User logged in:", user.email);

        // ✅ Fetch the player's saved level from Firestore
        const playerRef = doc(db, "players", user.uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
            const playerData = playerSnap.data();
            const lastLevel = playerData.level || 2; // ✅ Default to Level 2 if no data found

            console.log(`🔄 Checking if Level ${lastLevel} exists in riddles...`);

            // ✅ If the level exists, take them to it; otherwise, go to the waiting page
            if (riddles[lastLevel]) {
                console.log(`🎯 Level ${lastLevel} exists! Redirecting...`);
                result.innerHTML = `<span class='success-text'>Login successful! Redirecting to Level ${lastLevel}...</span>`;
                setTimeout(() => {
                    window.location.href = `level.html?level=${lastLevel}`;
                }, 2000);
            } else {
                console.warn(`⚠ Level ${lastLevel} does not exist! Redirecting to waiting page.`);
                result.innerHTML = "<span style='color: orange;'>Waiting for the next challenge...</span>";
                setTimeout(() => {
                    window.location.href = `waiting.html?level=${lastLevel}`;
                }, 2000);
            }
        } else {
            console.warn("⚠ No player data found. Redirecting to Level 2...");
            window.location.href = "level.html?level=2";
        }
    } catch (error) {
        console.error("❌ Login failed:", error);
        result.innerHTML = `<span style='color: red;'>Error: ${error.message}</span>`;
    }
});

// ✅ Ensure Users Stay Logged In & Redirect to Their Level
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("✅ User is already logged in:", user.email);

        const playerRef = doc(db, "players", user.uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
            const lastLevel = playerSnap.data().level || 2;

            // ✅ Redirect only if the level exists
            if (riddles[lastLevel]) {
                console.log(`🔄 Redirecting logged-in user to Level ${lastLevel}...`);
                window.location.href = `level.html?level=${lastLevel}`;
            } else {
                console.warn(`⚠ Level ${lastLevel} does not exist! Redirecting to waiting page.`);
                window.location.href = `waiting.html?level=${lastLevel}`;
            }
        }
    }
});

// ✅ Force reload to get latest data on mobile
window.onload = function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.unregister();
            });
        });
    }
};
