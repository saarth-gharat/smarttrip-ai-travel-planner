import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type RecommendationRequest = {
  destination: string;
  country?: string;
  days: number;
  people: number;
  budget: number;
  interests: string[];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing. Add it to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RecommendationRequest;

    const destination = body.destination?.trim();
    const country = body.country?.trim() || "";
    const days = Number(body.days);
    const people = Number(body.people);
    const budget = Number(body.budget);
    const interests = Array.isArray(body.interests)
      ? body.interests
      : [];

    if (!destination) {
      return NextResponse.json(
        { error: "Destination is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(days) || days < 1 || days > 60) {
      return NextResponse.json(
        { error: "Days must be between 1 and 60." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(people) || people < 1 || people > 50) {
      return NextResponse.json(
        { error: "Number of people must be between 1 and 50." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      return NextResponse.json(
        { error: "Budget must be greater than 0." },
        { status: 400 }
      );
    }

    if (interests.length === 0) {
      return NextResponse.json(
        { error: "At least one interest is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are Travelora's AI travel decision engine.

Analyze the user's travel requirements and recommend the best travel strategy.

IMPORTANT:
- Do not claim that you have live hotel prices.
- Do not claim that hotel availability is live.
- Do not claim that ratings are verified current ratings.
- Hotel prices and ratings must be presented as estimates.
- Do not invent booking links.
- Optimize the trip around the user's total budget.
- Consider the number of travelers, trip duration, and interests.
- Prefer practical recommendations over generic tourist advice.
- Explain why each recommendation is suitable.

USER TRIP:

Destination: ${destination}
Country: ${country || "Unknown"}
Days: ${days}
People: ${people}
Total budget: ₹${budget}
Interests: ${interests.join(", ")}

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "Short explanation of the recommended trip strategy.",
  "recommendedAreas": [
    {
      "name": "Area name",
      "description": "Why this area is suitable.",
      "whyRecommended": "Specific reason based on interests and budget.",
      "estimatedDailySpendPerPerson": 0,
      "score": 0
    }
  ],
  "recommendedHotels": [
    {
      "name": "Hotel recommendation name",
      "area": "Area name",
      "description": "Why this hotel is suitable.",
      "estimatedNightlyPrice": 0,
      "estimatedTotalStay": 0,
      "rating": 0,
      "score": 0,
      "budgetFit": "excellent"
    }
  ],
  "estimatedExpenses": {
    "hotel": 0,
    "food": 0,
    "transport": 0,
    "activities": 0,
    "miscellaneous": 0,
    "total": 0
  },
  "bestArea": "Best area name",
  "bestHotel": "Best hotel recommendation name",
  "budgetStatus": "within_budget",
  "budgetRemaining": 0,
  "recommendationReason": "Detailed explanation of why this combination is best."
}

Rules:
- Return exactly 3 recommended areas.
- Return exactly 3 hotel recommendations.
- Scores must be between 0 and 100.
- Ratings must be between 1 and 5.
- Hotel prices must be in Indian rupees.
- estimatedTotalStay represents the complete hotel stay.
- estimatedExpenses must be realistic for ${people} people for ${days} days.
- The estimated total must approximately equal:
  hotel + food + transport + activities + miscellaneous.
- Try to keep the total within the user's ₹${budget} budget.
- If the budget is too low, explain that clearly.
- budgetStatus must be one of:
  "within_budget",
  "close_to_budget",
  "over_budget".
`;

    /*
     * Gemini can temporarily return 503 when the model is under heavy load.
     * Retry a few times before returning an error to the user.
     */
    const maxAttempts = 3;

    let response;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        break;
      } catch (error) {
        console.error(
          `Gemini recommendation attempt ${attempt} failed:`,
          error
        );

        const message =
          error instanceof Error ? error.message : String(error);

        const isTemporaryError =
          message.includes("503") ||
          message.includes("UNAVAILABLE") ||
          message.includes("high demand") ||
          message.includes("temporarily");

        if (!isTemporaryError || attempt === maxAttempts) {
          throw error;
        }

        await sleep(attempt * 2000);
      }
    }

    const text = response?.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty response. Please try again.",
        },
        { status: 503 }
      );
    }

    let recommendation: unknown;

    try {
      recommendation = JSON.parse(text);
    } catch (parseError) {
      console.error("Gemini JSON parsing error:", parseError);
      console.error("Gemini response:", text);

      return NextResponse.json(
        {
          error: "Gemini returned invalid JSON. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error("Travelora Gemini recommendation error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    if (
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("high demand")
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily busy. Please wait a few seconds and try generating your recommendations again.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          message ||
          "Something went wrong while generating your recommendations.",
      },
      { status: 500 }
    );
  }
}