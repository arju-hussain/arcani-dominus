import { db } from "./firebase-config.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

export async function loadLeaderboard() {
    console.log("Loading leaderboard...");

    const leaderboardElement = document.getElementById("leaderboard");

    if (!leaderboardElement) {
        console.error("❌ Leaderboard element not found in the DOM.");
        return;
    }

    try {
        const leaderboardRef = collection(db, "players");
        const q = query(leaderboardRef, orderBy("level", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.warn("No players found in Firestore.");
            leaderboardElement.innerHTML = "<p>No players yet.</p>";
            leaderboardElement.style.display = "block"; // 🔹 Ensure visibility
            return;
        }

        let leaderboardHTML = "<h3>🏆 Top Players</h3><ol>";
        snapshot.forEach((doc, index) => {
            const player = doc.data();
            leaderboardHTML += `<li>#${index + 1} ${player.name} (Level ${player.level})</li>`;
        });
        leaderboardHTML += "</ol>";

        leaderboardElement.innerHTML = leaderboardHTML;
        leaderboardElement.style.display = "block"; // 🔹 Force visibility
        console.log("✅ Leaderboard updated successfully!");

    } catch (error) {
        console.error("❌ Error loading leaderboard:", error);
        leaderboardElement.innerHTML = "<p>Error loading leaderboard.</p>";
        leaderboardElement.style.display = "block"; // 🔹 Show error message
    }
}
