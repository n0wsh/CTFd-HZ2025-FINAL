import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { ScoreboardItem } from "@/server/scoreboard";
import { FirstBloodItem } from "@/server/firstblood";

import { useTaskQueue } from "@/contexts/TaskQueueContext";
import { playSound } from "@/core/SoundDispatcher";

export function useScoreboard({
  endAt,
  initialScoreboard,
  onFirstBlood,
}: {
  endAt: number;
  initialScoreboard: ScoreboardItem[];
  onFirstBlood?: (teamName: string, challengeName: string) => void;
}) {
  const [scoreboard, setScoreboard] = useState(initialScoreboard);
  const scoreboardRef = useRef(scoreboard);
  const taskQueue = useTaskQueue();

  useEffect(() => {
    scoreboardRef.current = scoreboard;
  }, [scoreboard]);

  // Initial fetch
  useEffect(() => {
    async function fetchInitialScoreboard() {
      try {
        const res = await fetch("/api/scoreboard");
        const data = await res.json();
        setScoreboard(data);
      } catch (err) {
        console.error("Failed to fetch initial scoreboard", err);
      }
    }
    fetchInitialScoreboard();
  }, []);

  // Sound when game ends
  useEffect(() => {
    const now = Date.now() / 1000;
    const timeUntilEnd = endAt - now;
    if (timeUntilEnd <= 0) return;

    const timeout = setTimeout(() => {
      playSound("end");
    }, timeUntilEnd * 1000);

    return () => clearTimeout(timeout);
  }, [endAt]);

  // WebSocket listener
  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin;
    const socket = io(backendUrl);

    socket.on(
      "submission",
      async (submission: {
        success: boolean;
        team: { id: number; name: string };
        challenge: { id: number; name: string; category: string };
        submission: { date: string };
      }) => {
        console.log("Received submission:", submission);

        if (!submission.success) {
          // Incorrect submission, increase fail count
          setScoreboard((scoreboard) =>
            scoreboard.map((standing) =>
              standing.id === submission.team.id
                ? { ...standing, fails: standing.fails + 1 }
                : standing
            )
          );
          return;
        }

        // Correct submission
        const [firstBlood, newScoreboard] = await Promise.all([
          fetch("/api/firstblood").then((res) => res.json()),
          fetch("/api/scoreboard").then((res) => res.json()),
        ]);

        console.log(firstBlood);

        const teamBloods = firstBlood.filter(
          (el: FirstBloodItem) => el.team_id === submission.team.id
        );

        const latestBlood = teamBloods[teamBloods.length - 1];
        const matchingTeam = newScoreboard.find(
          (team: ScoreboardItem) => team.id === latestBlood?.team_id
        );

        const updatedScoreboard = newScoreboard.map((team: ScoreboardItem) => {
          if (team.id === submission.team.id) {
            return {
              ...team,
              lastSubmission: {
                id: submission.challenge?.id ?? null,
                name: submission.challenge?.name ?? null,
                category: submission.challenge?.category ?? null,
                date: submission.submission.date ?? null,
              },
            };
          }
          return team;
        });

        taskQueue.push(async () => {
          await playSound("kill").catch(() => {});

          const playedFirstBloods: number[] = JSON.parse(
            localStorage.getItem("firstBloodList") || "[]"
          );

          const isAlreadyAnnounced = playedFirstBloods.includes(
            latestBlood?.challenge_id
          );

          if (!isAlreadyAnnounced && latestBlood) {
            console.log(`First blood for team: ${matchingTeam?.name}`);
            playedFirstBloods.push(latestBlood.challenge_id);
            localStorage.setItem(
              "firstBloodList",
              JSON.stringify(playedFirstBloods)
            );
            if (onFirstBlood) {
              onFirstBlood(matchingTeam.name, latestBlood.challenge_name);
            }
            await playSound("firstblood").catch(() => {});
          }

          setScoreboard(updatedScoreboard);
        });
      }
    );

    return () => {
      socket.close();
    };
  }, [taskQueue, onFirstBlood]);

  return { scoreboard };
}
