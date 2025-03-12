export async function loadAnnouncements() {
    try {
        console.log("📢 Fetching announcements...");
        const response = await fetch("announcements.json");

        if (!response.ok) {
            throw new Error(`Failed to load announcements (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log("✅ Announcements data:", data);

        const announcementsElement = document.getElementById("announcements");

        if (!announcementsElement) {
            console.error("❌ Element with ID 'announcements' not found in the HTML!");
            return;
        }

        // Check if data is an object (single announcement) or an array (multiple announcements)
        if (Array.isArray(data)) {
            if (data.length === 0) {
                announcementsElement.innerText = "No announcements at this time.";
            } else {
                announcementsElement.innerText = data[0].message;
            }
        } else {
            // If it's a single object
            announcementsElement.innerText = data.message || "No announcements at this time.";
        }

        console.log("✅ Announcements updated successfully!");
    } catch (error) {
        console.error("❌ Error loading announcements:", error);
        document.getElementById("announcements").innerText = "📢 Failed to load announcements.";
    }
}

// Ensure announcements load after the page fully loads
document.addEventListener("DOMContentLoaded", loadAnnouncements);
