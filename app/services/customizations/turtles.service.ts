import { $T } from "app/i18n/strings";

export interface TurtleInfo {
  id: string;
  name: string;
  imageData: string;
}

export interface TurtleSize {
  size: number;
  description: string;
}

export class TurtlesService {
  getAllTurtles(): TurtleInfo[] {
    return [
      {
        id: "tt12",
        name: $T.settings.turtleSkins.tt12,
        imageData: require("app/ui/images/turtles/tt12.svg") as string
      },
      {
        id: "tt2",
        name: $T.settings.turtleSkins.tt2,
        imageData: require("app/ui/images/turtles/tt2.svg") as string
      },
      {
        id: "tt9",
        name: $T.settings.turtleSkins.tt9,
        imageData: require("app/ui/images/turtles/tt9.svg") as string
      },
      {
        id: "tt10",
        name: $T.settings.turtleSkins.tt10,
        imageData: require("app/ui/images/turtles/tt10.svg") as string
      },
      {
        id: "tt11",
        name: $T.settings.turtleSkins.tt11,
        imageData: require("app/ui/images/turtles/tt11.svg") as string
      },
      {
        id: "tt13",
        name: $T.settings.turtleSkins.tt13,
        imageData: require("app/ui/images/turtles/tt13.svg") as string
      }
    ];
  }

  getTurtleInfo(turtleId: string): TurtleInfo {
    const allTurtles = this.getAllTurtles();
    let turtleData = allTurtles.find(t => t.id === turtleId);
    if (!turtleData) {
      turtleData = allTurtles[0];
    }
    return turtleData;
  }

  getTurtleImage(turtleId: string): HTMLImageElement {
    const turtleInfo = this.getTurtleInfo(turtleId);
    const img = new Image();
    img.width = 512;
    img.height = 512;
    img.src = turtleInfo.imageData;
    return img;
  }

  getTurtleSizes(): TurtleSize[] {
    return [
      { size: 20, description: $T.settings.turtleSizes.extraSmall },
      { size: 32, description: $T.settings.turtleSizes.small },
      { size: 40, description: $T.settings.turtleSizes.medium },
      { size: 52, description: $T.settings.turtleSizes.large },
      { size: 72, description: $T.settings.turtleSizes.huge }
    ];
  }
}
