import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

// ✅ Check If We Are on level.html Before Running the Script
if (window.location.pathname.includes("level.html")) {
    
    async function getLevelData(level) {
        try {
            const levelRef = doc(db, "answers", level.toString());
            const levelSnap = await getDoc(levelRef);

            if (levelSnap.exists()) {
                return levelSnap.data();
            } else {
                console.warn(`⚠️ No data found for Level ${level} in Firestore.`);
                return null;
            }
        } catch (error) {
            console.error("❌ Firestore error while fetching level data:", error);
            return null;
        }
    }

    async function loadLevel() {
        const urlParams = new URLSearchParams(window.location.search);
        const level = parseInt(urlParams.get("level")) || 2;

        const levelTitle = document.getElementById("levelTitle");
        const riddleText = document.getElementById("riddleText");

        const levelData = await getLevelData(level);
        
        if (levelTitle && riddleText && levelData) {
            levelTitle.innerText = `Level ${level}`;
            riddleText.innerText = levelData.riddle || "Riddle not found!";
        } else {
            console.warn("⚠️ WARNING: Level elements not found on this page. Skipping update.");
        }
    }

    async function getCorrectAnswer(level) {
        const levelData = await getLevelData(level);
        return levelData ? levelData.answer.toLowerCase() : null;
    }

    // 🔹 Check Answer & Progress
    async function submitAnswer() {
        const user = auth.currentUser; // ✅ Get logged-in user
        const feedback = document.getElementById("feedback");

        if (!user) {
            feedback.innerHTML = "<span style='color: red;'>Error: You need to log in first.</span>";
            console.warn("⚠️ No logged-in user found. Redirecting to login page...");
            setTimeout(() => {
                window.location.href = "login.html"; // ✅ Redirect to login page
            }, 2000);
            return;
        }

        const studentID = user.uid; // ✅ Use Firebase Auth User ID
        const urlParams = new URLSearchParams(window.location.search);
        const level = parseInt(urlParams.get("level")) || 2;

        const answer = document.getElementById("answerInput").value.trim().toLowerCase();
        const correctAnswer = await getCorrectAnswer(level);

        if (!correctAnswer) {
            feedback.innerHTML = "<span style='color: red;'>Error: Unable to verify answer.</span>";
            return;
        }

        if (answer === correctAnswer) { 
            feedback.innerHTML = "<span class='success-text'>Correct! Proceeding to next level...</span>";
            console.log(`✅ Correct answer entered for Level ${level}. Updating Firestore...`);

            try {
                const playerRef = doc(db, "players", studentID);
                await updateDoc(playerRef, { level: level + 1 });

                console.log("✅ Firestore update successful! Moving to next level...");

                const nextLevel = level + 1;

                // ✅ Ensure the update is confirmed before redirecting
                setTimeout(() => {
                    window.location.href = `level.html?level=${nextLevel}`;
                }, 2000);

            } catch (error) {
                console.error("❌ Firestore update failed:", error);
                feedback.innerHTML = "<span style='color: red;'>Error proceeding. Try again.</span>";
            }
        } else {
            feedback.innerHTML = "<span style='color: red;'>Wrong answer! Try again.</span>";
        }
    }

    // ✅ Attach Events Only If on level.html
    document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("submitAnswer")) {
            loadLevel();
            document.getElementById("submitAnswer").addEventListener("click", submitAnswer);
        }
    });

} else {
    console.warn("⚠️ Not on level.html. Skipping level script.");
}
