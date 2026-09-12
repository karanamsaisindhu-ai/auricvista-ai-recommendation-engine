const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 5000;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));


// ==========================================
// HISTORY STORAGE
// ==========================================

const historyFile = path.join(
    __dirname,
    "data",
    "history.json"
);

function saveHistory(preferences, recommendations) {

    const history = JSON.parse(
        fs.readFileSync(historyFile, "utf8")
    );

    history.push({
        timestamp: new Date().toISOString(),
        preferences: preferences,
        recommendations: recommendations
    });

    fs.writeFileSync(
        historyFile,
        JSON.stringify(history, null, 2)
    );
}


// ==========================================
// FALLBACK RECOMMENDATION
// ==========================================

function createFallback(destination, budget) {

    return {
        name: `Explore ${destination}`,
        type: "Tourism",
        matchScore: 70,
        budget: budget,
        reason:
            "A general recommendation based on your destination and budget.",
        safety:
            "Verify current safety information before travelling.",
        pros: [
            "Budget conscious",
            "Suitable for exploration"
        ],
        considerations: [
            "Check current prices",
            "Verify availability"
        ]
    };
}


// ==========================================
// AI RESPONSE VALIDATION
// ==========================================

function validateRecommendations(result) {

    if (!result || !Array.isArray(result.recommendations)) {
        return false;
    }

    if (result.recommendations.length !== 3) {
        return false;
    }

    for (const recommendation of result.recommendations) {

        if (
            !recommendation.name ||
            !recommendation.type ||
            typeof recommendation.matchScore !== "number" ||
            !recommendation.budget ||
            !recommendation.reason ||
            !recommendation.safety ||
            !Array.isArray(recommendation.pros) ||
            !Array.isArray(recommendation.considerations)
        ) {
            return false;
        }

        if (
            recommendation.matchScore < 0 ||
            recommendation.matchScore > 100
        ) {
            return false;
        }

        if (
            recommendation.pros.length === 0 ||
            recommendation.considerations.length === 0
        ) {
            return false;
        }
    }

    return true;
}


// ==========================================
// GENERATE RECOMMENDATIONS
// ==========================================

app.post("/api/recommend", async (req, res) => {

    try {

        const preferences = req.body;

        const {
            destination,
            budget,
            duration,
            stayType,
            interests,
            safety,
            food,
            transport
        } = preferences;


        // --------------------------------------
        // INPUT VALIDATION
        // --------------------------------------

        if (
            !destination ||
            !budget ||
            !duration ||
            !stayType ||
            !interests ||
            !safety ||
            !food ||
            !transport
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });

        }


        // --------------------------------------
        // PROMPT ENGINEERING
        // --------------------------------------

        const prompt = `
You are AuricVista's AI Travel Recommendation Engine.

Your job is to provide safe, affordable and personalized
travel recommendations for students and young travelers.

USER PREFERENCES:

Destination: ${destination}
Budget: ${budget}
Duration: ${duration}
Preferred Stay: ${stayType}
Interests: ${interests}
Safety Preference: ${safety}
Food Preference: ${food}
Transport Preference: ${transport}

PERSONALIZATION RULES:

- Use the user's destination.
- Respect the user's budget.
- Consider the trip duration.
- Consider the preferred stay type.
- Match the user's interests.
- Consider their safety preference.
- Consider their food preference.
- Consider their transport preference.
- Prioritize affordable options.
- Do not claim guaranteed prices or availability.
- Do not invent real-time information.
- If information may change, advise the user to verify it.
- Provide exactly 3 recommendations.
- Give every recommendation a match score from 0 to 100.
- Explain clearly why each recommendation matches the user.

OUTPUT RULES:

Return ONLY valid JSON.

Use exactly this structure:

{
  "recommendations": [
    {
      "name": "Recommendation name",
      "type": "Stay / Activity / Food / Tourism / Transport",
      "matchScore": 90,
      "budget": "Budget information",
      "reason": "Why this matches the user",
      "safety": "Safety consideration",
      "pros": [
        "Advantage 1",
        "Advantage 2"
      ],
      "considerations": [
        "Consideration 1",
        "Consideration 2"
      ]
    }
  ]
}
`;


        // --------------------------------------
        // AI GENERATION
        // --------------------------------------

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash",

            contents: prompt,

            config: {
                responseMimeType: "application/json"
            }

        });


        // --------------------------------------
        // PARSE AI RESPONSE
        // --------------------------------------

        let result;

        try {

            result = JSON.parse(response.text);

        } catch (error) {

            console.log(
                "AI returned invalid JSON. Using fallback."
            );

            const fallback = [
                createFallback(destination, budget)
            ];

            return res.json({
                success: true,
                fallback: true,
                recommendations: fallback
            });

        }


        // --------------------------------------
        // VALIDATE AI RESPONSE
        // --------------------------------------

        if (!validateRecommendations(result)) {

            console.log(
                "AI response failed validation. Using fallback."
            );

            const fallback = [
                createFallback(destination, budget)
            ];

            return res.json({
                success: true,
                fallback: true,
                recommendations: fallback
            });

        }


        // --------------------------------------
        // SAVE VALID RECOMMENDATIONS
        // --------------------------------------

        saveHistory(
            preferences,
            result.recommendations
        );


        // --------------------------------------
        // SEND RESPONSE
        // --------------------------------------

        res.json({

            success: true,

            fallback: false,

            recommendations:
                result.recommendations

        });

    }


    catch (error) {

        console.error("AI Error:", error);

        res.status(500).json({

            success: false,

            message:
                "Unable to generate recommendations right now."

        });

    }

});


// ==========================================
// RECOMMENDATION HISTORY API
// ==========================================

app.get("/api/history", (req, res) => {

    try {

        const history = JSON.parse(
            fs.readFileSync(historyFile, "utf8")
        );

        res.json({

            success: true,

            history: history.slice().reverse()

        });

    }

    catch (error) {

        console.error("History Error:", error);

        res.status(500).json({

            success: false,

            message:
                "Unable to load recommendation history."

        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `AuricVista Recommendation Engine running at http://localhost:${PORT}`
    );

});