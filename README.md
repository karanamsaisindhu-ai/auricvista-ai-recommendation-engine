# AuricVista AI-Powered Recommendation Engine

An AI-powered travel recommendation engine built for the AuricVista ecosystem. The system analyzes user preferences such as destination, budget, duration, stay type, interests, safety, food, and transport to generate personalized travel recommendations using Google Gemini AI.

## Overview

The AuricVista AI Recommendation Engine helps students and young travelers discover travel options based on their individual preferences.

The prototype demonstrates the complete:

**User Input → AI Processing → Recommendation → Validation → Output → History**

workflow.

## Objectives

- Process multiple user travel preferences.
- Generate personalized recommendations using AI.
- Integrate Google Gemini through an API.
- Apply prompt engineering for structured AI responses.
- Validate AI-generated recommendations.
- Handle invalid or incomplete AI responses using fallback logic.
- Store recommendation history.
- Provide a clean and user-friendly interface.

## Key Features

### Personalized Recommendations
Users provide:

- Destination
- Budget
- Trip duration
- Preferred stay
- Interests
- Safety priority
- Food preference
- Transport preference

The AI uses these preferences to generate three recommendations.

### AI Integration

The application uses the **Google Gemini API** to analyze user preferences and generate structured recommendations.

Each recommendation includes:

- Recommendation name
- Type
- Match score
- Budget information
- Reason for recommendation
- Safety consideration
- Pros
- Things to consider

### Prompt Engineering

The AI prompt is designed to:

- Consider all user preferences.
- Prioritize affordability and safety.
- Generate exactly three recommendations.
- Provide match scores from 0–100.
- Avoid claiming guaranteed prices or availability.
- Avoid inventing real-time information.
- Return structured JSON.

### Response Validation

The backend validates AI responses before displaying them.

It checks:

- Required fields
- Recommendation count
- Match score type
- Match score range
- Pros and considerations
- Overall response structure

Invalid or incomplete responses trigger fallback handling.

### Fallback Handling

If the AI returns invalid JSON or an incomplete response, the system provides a fallback recommendation instead of displaying broken data.

### Recommendation History

Previous recommendation sessions are stored locally in:

`data/history.json`

The system stores:

- Timestamp
- User preferences
- Generated recommendations

Users can view their previous recommendation sessions through the History section.

## System Workflow

```text
User Preferences
       ↓
Frontend Form
       ↓
Express API
       ↓
Prompt Engineering
       ↓
Google Gemini AI
       ↓
JSON Parsing
       ↓
Response Validation
       ↓
Personalized Recommendations
       ↓
History Storage

If the AI response is invalid:

Gemini AI
    ↓
Invalid Response
    ↓
Fallback Recommendation
    ↓
User Output
Technology Stack :
Frontend
HTML5
CSS3
JavaScript
Backend :
Node.js
Express.js
AI :
Google Gemini API
@google/genai
Storage :
JSON file storage
Tools :
Visual Studio Code
Git
GitHub 
Project Structure :
auricvista-ai-recommendation-engine/
│
├── data/
│   └── README.md
│
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
API Endpoints
Generate Recommendations
POST /api/recommend

Processes user preferences and generates personalized recommendations using Gemini AI.

Recommendation History
GET /api/history

Returns previously stored recommendation sessions.

Example Input
{
  "destination": "Mysore",
  "budget": "₹2,000 - ₹5,000",
  "duration": "2-3 days",
  "stayType": "Hostel",
  "interests": "Heritage, local food, photography",
  "safety": "Very important",
  "food": "Vegetarian",
  "transport": "Public transport"
}
Setup
1. Clone the repository
git clone https://github.com/karanamsaisindhu-ai/auricvista-ai-recommendation-engine.git
2. Navigate to the project
cd auricvista-ai-recommendation-engine
3. Install dependencies
npm install
4. Create .env

Create a .env file in the project root:

GEMINI_API_KEY=your_api_key_here

Never publish your API key to GitHub.

5. Start the server
node server.js
6. Open the application
http://localhost:5000
Security

The Gemini API key is stored in an environment variable and excluded from Git using .gitignore.

The recommendation history file is also excluded from version control.

Future Enhancements
Real-time travel and hotel APIs
Live maps and location services
Booking integration
User accounts
Cloud-based recommendation history
User feedback-based recommendation learning
Multi-destination trip planning
Advanced recommendation ranking
Integration with AuricVista's broader ecosystem
Conclusion

The AuricVista AI-Powered Recommendation Engine demonstrates how generative AI can be used to create personalized travel experiences based on individual preferences.
