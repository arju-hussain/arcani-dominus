import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

export async function getRiddle(level) {
    try {
        const levelRef = doc(db, "answers", level.toString());
        const levelSnap = await getDoc(levelRef);

        if (levelSnap.exists()) {
            return levelSnap.data().riddle;
        } else {
            console.warn(`⚠️ No riddle found for Level ${level}`);
            return "Riddle not found!";
        }
    } catch (error) {
        console.error("❌ Firestore error while fetching riddle:", error);
        return "Error loading riddle!";
    }
}

// ✅ Ensure Users Stay Logged In & Redirect to Their Level
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("✅ User is already logged in:", user.email);

        const playerRef = doc(db, "players", user.uid);
        const playerSnap = await getDoc(playerRef);

        if (playerSnap.exists()) {
            const lastLevel = playerSnap.data().level || 2;
            const urlParams = new URLSearchParams(window.location.search);
            const currentLevel = parseInt(urlParams.get("level")) || 2;

            if (lastLevel !== currentLevel) {
                console.log(`🔄 Redirecting user to their correct level: ${lastLevel}`);
                window.location.href = `level.html?level=${lastLevel}`;
            } else {
                console.log(`✅ User is already on the correct level: ${currentLevel}`);
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
