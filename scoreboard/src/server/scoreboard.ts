import { APIResponse } from "./types";

export type LastSubmission = {
  challenge_id: number;
  challenge_name: string;
  category: string;
  date: string;
};

export type ScoreboardItem = {
  id: number;
  name: string;
  score: number;
  solves: number;
  fails: number;
  place: number;
  lastSubmission?: LastSubmission;
};
export async function fetchScoreboard() {
  if (process.env.IS_BUILD === "true") {
    return [];
  }

  try {
    const result: APIResponse<ScoreboardItem[]> = await fetch(
      `${process.env.CTFD_API_URL}/custom/standings`
    ).then((res) => res.json());
    return result.data;
  } catch (err) {
    console.error("Failed to fetch scoreboard:", err);
    return [];
  }
}
