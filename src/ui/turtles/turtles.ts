import { $T } from "i18n-strings";

export interface TurtleInfo {
  id: string;
  name: string;
  imageSrc: string;
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
      imageSrc: "./content/images/turtles/bright_runner.svg"
    },
    {
      id: "chameleon",
      name: $T.settings.turtleSkins.chameleon,
      imageSrc: "./content/images/turtles/chameleon.svg"
    },
    {
      id: "princess",
      name: $T.settings.turtleSkins.princess,
      imageSrc: "./content/images/turtles/princess.svg"
    },
    {
      id: "bob",
      name: $T.settings.turtleSkins.bob,
      imageSrc: "./content/images/turtles/bob.svg"
    },
    {
      id: "summer",
      name: $T.settings.turtleSkins.summer,
      imageSrc: "./content/images/turtles/summer.svg"
    },
    {
      id: "diver",
      name: $T.settings.turtleSkins.diver,
      imageSrc: "./content/images/turtles/diver.svg"
    },
    {
      id: "navigator-aqua",
      name: "Navigator Aqua",
      imageSrc: "./content/images/turtles/navigator-aqua.svg"
    },
    {
      id: "navigator-stealth",
      name: "Navigator Stealth",
      imageSrc: "./content/images/turtles/navigator-stealth.svg"
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
