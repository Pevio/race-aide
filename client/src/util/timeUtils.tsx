import { DateTime } from "luxon";

export const timezoneDescriptions: Record<string, string> = {
  GMT: "Greenwich Mean Time",
  UTC: "Universal Coordinated Time",
  ECT: "European Central Time",
  EET: "Eastern European Time",
  ART: "(Arabic) Egypt Standard Time",
  EAT: "Eastern African Time",
  MET: "Middle East Time",
  NET: "Near East Time",
  PLT: "Pakistan Lahore Time",
  IST: "India Standard Time",
  BST: "Bangladesh Standard Time",
  VST: "Vietnam Standard Time",
  CTT: "China Taiwan Time",
  JST: "Japan Standard Time",
  ACT: "Australia Central Time",
  AET: "Australia Eastern Time",
  SST: "Solomon Standard Time",
  NST: "New Zealand Standard Time",
  MIT: "Midway Islands Time",
  HST: "Hawaii Standard Time",
  AST: "Alaska Standard Time",
  PST: "Pacific Standard Time",
  PNT: "Phoenix Standard Time",
  MST: "Mountain Standard Time",
  CST: "Central Standard Time",
  EST: "Eastern Standard Time",
  IET: "Indiana Eastern Standard Time",
  PRT: "Puerto Rico and US Virgin Islands Time",
  CNT: "Canada Newfoundland Time",
  AGT: "Argentina Standard Time",
  BET: "Brazil Eastern Time",
  CAT: "Central African Time",
};

export const combineDateTime = (
  date: Date | null,
  timeOfDay: Date | null,
  timezone?: string
): number => {
  if (!date || !timeOfDay) return 0;
  const timeObj = DateTime.now()
    .setZone(timezone)
    .set({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: timeOfDay.getHours(),
      minute: timeOfDay.getMinutes(),
    });
  return timeObj.toMillis();
};
export const displayTimestamp = (
  millis?: number,
  timezone?: string,
  format: string = "DD, hh:mm a"
): string => {
  if (!millis) return "";
  const resultTime = DateTime.fromMillis(millis);
  if (timezone) resultTime.setZone(timezone);
  return resultTime.toFormat(format);
};

export const displayTime = (
  seconds: number,
  showHours: boolean = false
): string => {
  const twoDigitNumber = (num: number): string => {
    const displayNum = Math.floor(num);
    return displayNum >= 10 ? String(displayNum) : `0${displayNum}`;
  };
  let minutePart = seconds / 60.0;
  let secondPart = seconds % 60;
  if (!showHours)
    return `${Math.floor(minutePart)}:${twoDigitNumber(secondPart)}`;
  const hourPart = Math.floor(minutePart / 60);
  minutePart = Math.floor(minutePart) % 60;
  return `${hourPart}:${twoDigitNumber(minutePart)}:${twoDigitNumber(
    secondPart
  )}`;
};
