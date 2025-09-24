import { NextApiRequest, NextApiResponse } from "next";
import { fetchScoreboard } from "@/server/scoreboard";

const scoreboardHandler = async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    const scoreboard = await fetchScoreboard();
    res.status(200).json(scoreboard);
  } catch (error) {
    console.error("Failed to fetch scoreboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default scoreboardHandler;