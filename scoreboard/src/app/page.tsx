"use server";

import { fetchScoreboard, ScoreboardItem } from "@/server/scoreboard";

import { fetchCTFStatus } from "@/server/status";
import { Scoreboard } from "@/widgets/Scoreboard";
import { CTFTimeClient } from "@/widgets/CTFTime";

export type ScoreboardInitialData = {
  scoreboard: ScoreboardItem[];
};

export default async function Home() {
  const { startAt, endAt } = await fetchCTFStatus();

  // if (!started) {
  //   return (
  //     <>
  //       <CTFTimeClient startAt={startAt} />
  //       <h1 className="font-(family-name:--font-highspeed) text-4xl">
  //         Haruul Zangi U18 - 2025 FINAL
  //       </h1>
  //     </>
  //   );
  // }

  const initialScoreboard = await fetchScoreboard();

  return (
    <>
      <CTFTimeClient startAt={startAt} />
      <Scoreboard initialScoreboard={initialScoreboard} endAt={endAt} />
    </>
  );
}
