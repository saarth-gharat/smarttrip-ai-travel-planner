import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type ItineraryRequest = {
  destination: string;
  country?: string;
  days: number;
  people: number;
  budget: number;
  interests: string[];
  selectedArea: string;
  selectedHotel: string;
};

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

    const body = (await request.json()) as ItineraryRequest;

    const destination = body.destination?.trim();
    const country = body.country?.trim() || "";
    const days = Number(body.days);
    const people = Number(body.people);
    const budget = Number(body.budget);
    const interests = Array.isArray(body.interests)
      ? body.interests
      : [];
    const selectedArea = body.selectedArea?.trim();
    const selectedHotel = body.selectedHotel?.trim();

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

    if (!selectedArea) {
      return NextResponse.json(
        { error: "Please select an area." },
        { status: 400 }
      );
    }

    if (!selectedHotel) {
      return NextResponse.json(
        { error: "Please select a hotel." },
        { status: 400 }
      );
    }

    const prompt = `
You are Travelora's AI itinerary engine.

Create a practical day-by-day travel itinerary based on the user's
destination, selected area, selected hotel, interests, number of travelers,
trip length and total budget.

TRIP INFORMATION:

Destination: ${destination}
Country: ${country || "Unknown"}
Trip length: ${days} days
Travelers: ${people}
Total budget: ₹${budget}
Interests: ${interests.join(", ")}

SELECTED AREA:
${selectedArea}

SELECTED HOTEL:
${selectedHotel}

IMPORTANT:

- The traveler is staying around the selected hotel and area.
- Organize activities geographically where possible.
- Avoid unnecessary backtracking.
- Prioritize the user's selected interests.
- Include realistic travel time between activities.
- Do not overload each day.
- Include meals when appropriate.
- Include free/low-cost activities when useful for staying within budget.
- Do not claim live availability.
- Do not claim live prices.
- Activity costs must be estimates.
- Do not invent booking links.
- Hotel pricing is already handled separately.
- The itinerary should focus on activities, food, sightseeing, experiences,
  local exploration and transportation.
- Consider arrival and departure days realistically.
- If the destination is known, use well-known attractions and neighborhoods
  that are genuinely associated with that destination.
- Never create obviously fictional attractions.

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "Trip title",
  "overview": "Short explanation of the itinerary strategy.",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "summary": "Short summary of this day's plan.",
      "activities": [
        {
          "title": "Activity name",
          "description": "What the traveler will do.",
          "location": "Location or area",
          "startTime": "09:00",
          "endTime": "11:00",
          "estimatedCostPerPerson": 0,
          "category": "Sightseeing"
        }
      ],
      "estimatedDailyCostPerPerson": 0
    }
  ],
  "estimatedActivityCost": 0,
  "estimatedTransportCost": 0,
  "estimatedFoodCost": 0,
  "estimatedMiscellaneousCost": 0,
  "estimatedTotalWithoutHotel": 0,
  "budgetAdvice": "Advice for staying within the total budget."
}

Rules:

- Return exactly ${days} days.
- Every day must contain at least 2 activities.
- Normally use 2 to 5 activities per day.
- Use realistic time ranges.
- Times must use 24-hour HH:MM format.
- estimatedCostPerPerson must be in Indian rupees.
- Use 0 for genuinely free activities.
- estimatedDailyCostPerPerson should approximately equal the activity costs
  for that day plus reasonable local transport/other activity expenses.
- Keep the complete non-hotel portion of the trip appropriate for a total
  budget of ₹${budget}.
- Do not include the hotel price in estimatedTotalWithoutHotel.
- Do not invent exact current prices.
- Clearly treat all costs as estimates.
- Make the itinerary feel personalized to these interests:
  ${interests.join(", ")}
- The selected hotel is the starting point for each day where practical.
- Include a sensible mix of major attractions and local experiences.
- Avoid repeating the same type of activity every day.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty itinerary.",
        },
        { status: 500 }
      );
    }

    let itinerary: unknown;

    try {
      itinerary = JSON.parse(text);
    } catch (parseError) {
      console.error("Gemini itinerary JSON parsing error:", parseError);
      console.error("Gemini itinerary response:", text);

      return NextResponse.json(
        {
          error: "Gemini returned invalid itinerary JSON.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      itinerary,
    });
  } catch (error) {
    console.error("Travelora Gemini itinerary error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the itinerary.",
      },
      { status: 500 }
    );
  }
}