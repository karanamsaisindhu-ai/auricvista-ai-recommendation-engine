const form = document.getElementById("recommendationForm");
const results = document.getElementById("results");
const loading = document.getElementById("loading");
const historyBtn = document.getElementById("historyBtn");
const historyContainer = document.getElementById("history");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    results.innerHTML = "";
    loading.classList.remove("hidden");

    const userPreferences = {
        destination: document.getElementById("destination").value,
        budget: document.getElementById("budget").value,
        duration: document.getElementById("duration").value,
        stayType: document.getElementById("stayType").value,
        interests: document.getElementById("interests").value,
        safety: document.getElementById("safety").value,
        food: document.getElementById("food").value,
        transport: document.getElementById("transport").value
    };

    try {

        const response = await fetch("/api/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userPreferences)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Something went wrong.");
        }

        displayRecommendations(data);

    } catch (error) {

        results.innerHTML = `
            <div class="fallback">
                Unable to generate recommendations.
                Please try again.
            </div>
        `;

        console.error(error);

    } finally {

        loading.classList.add("hidden");

    }
});


function displayRecommendations(data) {

    let html = "";

    if (data.fallback) {
        html += `
            <div class="fallback">
                ⚠ AI recommendations were temporarily unavailable.
                A fallback recommendation is being shown.
            </div>
        `;
    }

    html += `
        <h2>Your Personalized Recommendations</h2>

        <div class="recommendation-grid">
    `;

    data.recommendations.forEach((recommendation) => {

        html += `
            <div class="recommendation-card">

                <div class="score">
                    ${recommendation.matchScore}% Match
                </div>

                <h3>${recommendation.name}</h3>

                <div class="type">
                    ${recommendation.type}
                </div>

                <p>
                    <strong>Budget:</strong>
                    ${recommendation.budget}
                </p>

                <p>
                    <strong>Why it matches:</strong><br>
                    ${recommendation.reason}
                </p>

                <p>
                    <strong>Safety:</strong><br>
                    ${recommendation.safety}
                </p>

                <p>
                    <strong>Pros:</strong>
                </p>

                <ul>
                    ${recommendation.pros
                        .map(pro => `<li>${pro}</li>`)
                        .join("")}
                </ul>

                <p>
                    <strong>Things to consider:</strong>
                </p>

                <ul>
                    ${recommendation.considerations
                        .map(item => `<li>${item}</li>`)
                        .join("")}
                </ul>

            </div>
        `;

    });

    html += `</div>`;

    results.innerHTML = html;
}


historyBtn.addEventListener("click", async () => {

    historyContainer.innerHTML = "<p>Loading history...</p>";

    try {

        const response = await fetch("/api/history");

        const data = await response.json();

        if (!data.success || data.history.length === 0) {

            historyContainer.innerHTML =
                "<p>No recommendation history yet.</p>";

            return;
        }

        historyContainer.innerHTML = data.history
            .map(item => {

                return `
                    <div class="history-card">

                        <strong>
                            ${item.preferences.destination}
                        </strong>

                        <span>
                            ${new Date(item.timestamp).toLocaleString()}
                        </span>

                        <p>
                            ${item.recommendations.length}
                            recommendations generated
                        </p>

                    </div>
                `;

            })
            .join("");

    } catch (error) {

        historyContainer.innerHTML =
            "<p>Unable to load recommendation history.</p>";

        console.error(error);

    }

});