import { $T } from "i18n-strings";

export interface TurtleInfo {
  id: string;
  name: string;
  imageData: string;
}

export interface TurtleSize {
  size: number;
  description: string;
}

export function getTurtles(): TurtleInfo[] {
  return [
    {
      id: "bright_runner",
      name: $T.settings.turtleSkins.bright_runner,
      imageData: require("./bright_runner.svg") as string
    },
    {
      id: "chameleon",
      name: $T.settings.turtleSkins.chameleon,
      imageData: require("./chameleon.svg") as string
    },
    {
      id: "princess",
      name: $T.settings.turtleSkins.princess,
      imageData: require("./princess.svg") as string
    },
    {
      id: "bob",
      name: $T.settings.turtleSkins.bob,
      imageData: require("./bob.svg") as string
    },
    {
      id: "summer",
      name: $T.settings.turtleSkins.summer,
      imageData: require("./summer.svg") as string
    },
    {
      id: "diver",
      name: $T.settings.turtleSkins.diver,
      imageData: require("./diver.svg") as string
    },
    {
      id: "navigator-aqua",
      name: "Navigator Aqua",
      imageData: require("./navigator-aqua.svg") as string
    },
    {
      id: "navigator-stealth",
      name: "Navigator Stealth",
      imageData: require("./navigator-stealth.svg") as string
    }
  ];
}

export function getTurtleSizes(): TurtleSize[] {
  return [
    { size: 20, description: $T.settings.turtleSizes.extraSmall },
    { size: 32, description: $T.settings.turtleSizes.small },
    { size: 40, description: $T.settings.turtleSizes.medium },
    { size: 52, description: $T.settings.turtleSizes.large },
    { size: 72, description: $T.settings.turtleSizes.huge }
  ];
}

export function getTurtleById(turtleId: string): TurtleInfo {
  const allTurtles = getTurtles();
  let turtleData = allTurtles.find(t => t.id === turtleId);
  if (!turtleData) {
    turtleData = allTurtles[0];
  }
  return turtleData;
}

export function getTurtleImage(turtleId: string): HTMLImageElement {
  const turtleInfo = getTurtleById(turtleId);
  const img = new Image();
  img.width = 512;
  img.height = 512;
  img.src = turtleInfo.imageData;
  return img;
}
