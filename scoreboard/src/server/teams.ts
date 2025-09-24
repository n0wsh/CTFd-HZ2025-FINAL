import { PaginatedData } from "./types";

export type Team = { name: string };

export async function fetchTeams(): Promise<Team[]> {
  try {
    const response = await fetch(`${process.env.CTFD_API_URL}/teams`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CTFD_API_KEY}`,
      },
    });

    if (!response.ok) {
      const text = await response.text(); // Helpful for debugging
      throw new Error(`Fetch failed: ${response.status} ${text}`);
    }

    const result: PaginatedData<Team> = await response.json();

    if (!result.data) {
      throw new Error("API response missing 'data' field.");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
}
