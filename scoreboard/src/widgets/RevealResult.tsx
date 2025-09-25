"use client";
import React, { useState, useRef, useEffect } from "react";

import { LastSubmission, ScoreboardItem } from "@/server/scoreboard";
import { useScoreboard } from "@/hooks/useScoreboard";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Trophy,
  Zap,
  Clock,
  Users,
  Target,
  Flame,
  Volume2,
  Snowflake,
  X,
} from "lucide-react";
import { timeAgoUlaanbaatar } from "@/lib/utils";

interface CTFPlayer {
  id: string;
  teamname: string;
  avatar: string;
  place: number;
  score: number;
  // lastSolve: string;
  totalSolves: number;
  lastSubmission?: LastSubmission;
}

const avatarList = [
  "/hacker-avatar-ninja.jpg",
  "/elite-hacker-avatar.png",
  "/cyberpunk-hacker-avatar.png",
  "/hacker-avatar-crypto.jpg",
  "/hacker-avatar-web.jpg",
  "/hacker-avatar-binary.jpg",
  "/hacker-avatar-forensics.jpg",
  "/hacker-avatar-reverse.jpg",
  "/hacker-avatar-pwn.jpg",
  "/hacker-avatar-steg.jpg",
];

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "crypto":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-400/20";
    case "web":
      return "bg-green-500/10 text-green-400 border-green-400/20";
    case "binary":
      return "bg-red-500/10 text-red-400 border-red-400/20";
    case "forensics":
      return "bg-purple-500/10 text-purple-400 border-purple-400/20";
    case "reverse":
      return "bg-orange-500/10 text-orange-400 border-orange-400/20";
    case "pwn":
      return "bg-pink-500/10 text-pink-400 border-pink-400/20";
    case "steganography":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-400/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-400/20";
  }
};

export const RevealResult = ({
  initialScoreboard,
  endAt,
}: {
  initialScoreboard: ScoreboardItem[];
  endAt: number;
}) => {
  const { scoreboard } = useScoreboard({
    endAt,
    initialScoreboard,
    onFirstBlood: (teamName, challengeName) => {
      // Trigger modal and audio
      setCurrentFirstBlood(
        `🩸 FIRST BLOOD! ${teamName} solved "${challengeName}"`
      );
      setShowFullScreenModal(true);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }

      setTimeout(() => setShowFullScreenModal(false), 4000);

      const list = JSON.parse(localStorage.getItem("firstBloodList") || "[]");
      setFirstBloodCount(list.length);
    },
  });

  const topPlayers = scoreboard.slice(0, 3).map((team) => ({
    id: String(team.id),
    teamname: team.name,
    avatar:
      "/assets/images" + avatarList[(team.id - 1) % avatarList.length] ||
      "/placeholder.svg",
    place: team.place,
    score: team.score,
    totalSolves: team.solves,
    lastSolvedCategory: team.lastSubmission?.category || "",
    lastSolveDate: timeAgoUlaanbaatar(team.lastSubmission?.date),
  }));

  const recentActivity = scoreboard.slice(3).map((team) => ({
    id: String(team.id),
    teamname: team.name,
    avatar:
      "/assets/images" + avatarList[(team.id - 1) % avatarList.length] ||
      "/placeholder.svg",
    place: team.place,
    rank: team.place,
    score: team.score,
    totalSolves: team.solves,
    lastSolvedCategory: team.lastSubmission?.category || "",
    lastSolveDate: timeAgoUlaanbaatar(team.lastSubmission?.date),
  }));

  const [isStarted, setIsStarted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const [currentFirstBlood, setCurrentFirstBlood] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const swapAudioRef = useRef<HTMLAudioElement>(null);
  const [firstBloodCount, setFirstBloodCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    endAt - Math.floor(Date.now() / 1000)
  );
  const [revealed, setRevealed] = useState(0); // 0 = none, 1 = third, 2 = second, 3 = champion

  useEffect(() => {
    const handleClick = () => {
      setRevealed((prev) => Math.min(prev + 1, 4));
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const revealClass = (index: number) =>
    revealed >= index
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-16";

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("firstBloodList") || "[]");
    setFirstBloodCount(list.length);
    console.log(scoreboard);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endAt - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        console.log("⏰ CTF has ended!");
        // playSound("end");
      } else {
        setTimeLeft(remaining);

        // SCOREBOARD FREEZE
        if (remaining <= 3600 && !isFrozen) {
          setIsFrozen(true);
          console.log("❄️ Scoreboard frozen (1 hour left)");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const getPlaceIcon = (place: number) => {
    switch (place) {
      case 1:
        return <Trophy className="w-5 h-5" />;
      case 2:
        return <Shield className="w-4 h-4" />;
      case 3:
        return <Zap className="w-4 h-4" />;
      default:
        return <span className="text-lg font-bold">{place}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center clean-border ${
                isFrozen ? "frozen-element" : ""
              }`}
            >
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-balance">
                Харуул Занги 2025
                {isFrozen && (
                  <span className="text-cyan-400 ml-2 text-xl">❄️ FROZEN</span>
                )}
              </h1>
              {/* <p className="text-muted-foreground text-pretty text-sm">
                    {isFrozen
                      ? "Scoreboard is frozen for the final hour!"
                      : "Rankings update in real-time. Hack your way to the top!"}
                  </p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-10">
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-12 items-end ${
            isSwapping ? "leader-swap-animation" : ""
          } ${isFrozen ? "frozen-scoreboard" : ""}`}
        >
          <div
            className={`order-1 md:order-1 transition-all duration-700 ease-out delay-300 ${revealClass(
              2
            )}`}
          >
            <Card className="clean-border p-4 text-center relative overflow-hidden battle-float-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10" />
              <div className="relative z-10">
                <div className="mb-3 flex justify-center">
                  <div className="relative">
                    <img
                      src={topPlayers[1].avatar || "/placeholder.svg"}
                      alt={topPlayers[1].teamname}
                      className="w-16 h-16 rounded-full border-2 border-blue-400/60 battle-glow-blue"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center battle-pulse">
                      {getPlaceIcon(2)}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {topPlayers[1].teamname}
                </h3>
                <div className="text-blue-400 font-bold text-base mb-3">
                  {"Байр #2"}
                </div>
                <Card className="bg-blue-500/10 border-blue-400/20 p-3 gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      Сүүлд бодсон огноо
                    </span>
                    <span className="text-blue-400 font-mono">
                      {topPlayers[1].lastSolveDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-muted-foreground">Нийт оноо</span>
                    <span className="text-blue-400 font-mono text-lg">
                      {topPlayers[1].score.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          <div
            className={`order-2 md:order-2 transform md:scale-105 transition-all duration-700 ease-out delay-600 ${revealClass(
              3
            )}`}
          >
            <Card className="clean-border p-5 text-center relative overflow-hidden winner-glow battle-float-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 to-orange-600/12" />
              <div className="relative z-10">
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <img
                      src={topPlayers[0].avatar || "/placeholder.svg"}
                      alt={topPlayers[0].teamname}
                      className="w-18 h-18 rounded-full border-3 border-orange-400/60 battle-glow-champion"
                    />
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center battle-pulse-strong">
                      {getPlaceIcon(1)}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {topPlayers[0].teamname}
                </h3>
                <div className="text-orange-400 font-bold text-lg mb-4">
                  {"Байр #1"}
                </div>
                <Card className="bg-orange-500/10 border-orange-400/20 p-3 gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      Сүүлд бодсон огноо
                    </span>
                    <span className="text-orange-400 font-mono">
                      {topPlayers[0].lastSolveDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-muted-foreground">Нийт оноо</span>
                    <span className="text-orange-400 font-mono font-bold text-lg">
                      {topPlayers[0].score.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          <div
            className={`order-3 md:order-3 transition-all duration-700 ease-out ${revealClass(
              1
            )}`}
          >
            <Card className="clean-border p-4 text-center relative overflow-hidden battle-float-3">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/10" />
              <div className="relative z-10">
                <div className="mb-3 flex justify-center">
                  <div className="relative">
                    <img
                      src={topPlayers[2].avatar || "/placeholder.svg"}
                      alt={topPlayers[2].teamname}
                      className="w-16 h-16 rounded-full border-2 border-cyan-400/60 battle-glow-cyan"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center battle-pulse">
                      {getPlaceIcon(3)}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {topPlayers[2].teamname}
                </h3>
                <div className="text-cyan-400 font-bold text-base mb-3">
                  {"Байр #3"}
                </div>
                <Card className="bg-cyan-500/10 border-cyan-400/20 p-3 gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      Сүүлд бодсон огноо
                    </span>
                    <span className="text-cyan-400 font-mono">
                      {topPlayers[2].lastSolveDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-muted-foreground">Нийт оноо</span>
                    <span className="text-cyan-400 font-mono text-lg">
                      {topPlayers[2].score.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {revealed >= 4 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {recentActivity.map((player, index) => (
            <Card
              key={player.id}
              className="clean-border p-4 hover:bg-card/60 transition-all duration-300 team-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={player.avatar || "/placeholder.svg"}
                      alt={player.teamname}
                      className="w-10 h-10 rounded-full border border-primary/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-xs font-bold">
                      {player.place}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-xl">
                      {player.teamname}
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      {player.totalSolves} бодлого бодсон
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={`px-2 py-1 text-xs ${getCategoryColor(
                      player?.lastSolvedCategory
                    )}`}
                  >
                    {player?.lastSolvedCategory}
                  </Badge>
                  <div className="text-right">
                    <div className="font-bold text-xl">
                      {player.score.toLocaleString()} оноо
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last: {player.lastSolveDate}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
