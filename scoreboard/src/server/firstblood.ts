import { APIResponse } from "./types";

export type FirstBloodItem = {
  challenge_id: number;
  team_id: number;
};

export async function fetchFirstBlood() {
  try {
    const result: APIResponse<FirstBloodItem[]> = await fetch(
      `${process.env.CTFD_API_URL}/custom/first-blood`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CTFD_API_KEY}`,
        },
      }
    ).then((res) => res.json());

    if (result.data) {
      return result.data;
    } else {
      throw new Error("Response data is missing.");
    }
  } catch (error) {
    console.error("Error fetching hero picks:", error);
    throw error;
  }
}
