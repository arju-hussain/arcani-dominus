import { auth, db } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

async function submitAnswer() {
    const user = auth.currentUser;  
    const feedback = document.getElementById("feedback");

    if (!user) {
        feedback.innerHTML = "<span style='color: red;'>Error: You need to log in first.</span>";
        setTimeout(() => { window.location.href = "login.html"; }, 2000);
        return;
    }

    const studentID = user.uid;  
    const urlParams = new URLSearchParams(window.location.search);
    const level = parseInt(urlParams.get("level")) || 2;

    const userAnswer = document.getElementById("answerInput").value.trim().toLowerCase();

    try {
        // 🔥 Fetch correct answer from Firestore
        const answerDoc = await getDoc(doc(db, "answers", level.toString()));
        
        if (!answerDoc.exists()) {
            feedback.innerHTML = "<span style='color: red;'>Error: Answer not found.</span>";
            console.error(`❌ Firestore Error: No answer found for Level ${level}`);
            return;
        }

        const correctAnswer = answerDoc.data().answer.toLowerCase();

        if (userAnswer === correctAnswer) { 
            feedback.innerHTML = "<span class='success-text'>Correct! Proceeding to next level...</span>";

            await updateDoc(doc(db, "players", studentID), { level: level + 1 });

            setTimeout(() => {
                if (document.getElementById(`riddle-${level + 1}`)) {
                    window.location.href = `level.html?level=${level + 1}`;
                } else {
                    window.location.href = `waiting.html?level=${level}`;
                }
            }, 2000);
        } else {
            feedback.innerHTML = "<span style='color: red;'>Wrong answer! Try again.</span>";
        }
    } catch (error) {
        console.error("❌ Firestore error:", error);
        feedback.innerHTML = "<span style='color: red;'>Error checking answer. Try again.</span>";
    }
}
