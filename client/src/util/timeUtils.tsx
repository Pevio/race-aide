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

export const displayTime = (seconds: number): string => {
  const minutePart = Math.floor(seconds / 60)
  const secondPart = seconds & 60
  return `${minutePart}:${secondPart >= 10 ? secondPart : "0" + secondPart}`
}