import { agentConfig } from "@/data/agent";

function istParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: agentConfig.timezone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(now).map((x) => [x.type, x.value]));
  const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  const hour = Number(p.hour) % 24;
  return { day: dayIdx, minutes: hour * 60 + Number(p.minute) };
}

export type OpenStatus = { open: boolean; acceptingOrders: boolean; note: string };

/** Handles past-midnight closing (e.g. Fri close 25 = 1 AM Saturday). */
export function openStatus(now = new Date()): OpenStatus {
  const { day, minutes } = istParts(now);
  const today = agentConfig.hours[day];
  const yesterday = agentConfig.hours[(day + 6) % 7];
  const lastOrderBuffer = agentConfig.lastOrderBeforeCloseMins;

  // Still inside yesterday's late-night window?
  if (yesterday.close > 24 && minutes < (yesterday.close - 24) * 60) {
    const left = (yesterday.close - 24) * 60 - minutes;
    return { open: true, acceptingOrders: left > lastOrderBuffer, note: "open (late night)" };
  }
  if (minutes >= today.open * 60 && minutes < today.close * 60) {
    const left = today.close * 60 - minutes;
    return { open: true, acceptingOrders: left > lastOrderBuffer, note: "open" };
  }
  return { open: false, acceptingOrders: false, note: "closed" };
}
