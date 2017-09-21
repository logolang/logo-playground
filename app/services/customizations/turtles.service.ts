import { _T } from "app/services/customizations/localization.service";
import { injectable } from "app/di";

export interface TurtleInfo {
  id: string;
  getName: () => string;
  imageData: string;
}

const allTurtles: TurtleInfo[] = [
  {
    id: "tt12",
    getName: () => _T("Turtle Name tt12"),
    imageData: require("app/ui/images/turtles/tt12.svg") as string
  },
  {
    id: "tt2",
    getName: () => _T("Turtle Name tt2"),
    imageData: require("app/ui/images/turtles/tt2.svg") as string
  },
  {
    id: "tt9",
    getName: () => _T("Turtle Name tt9"),
    imageData: require("app/ui/images/turtles/tt9.svg") as string
  },
  {
    id: "tt10",
    getName: () => _T("Turtle Name tt10"),
    imageData: require("app/ui/images/turtles/tt10.svg") as string
  },
  {
    id: "tt11",
    getName: () => _T("Turtle Name tt11"),
    imageData: require("app/ui/images/turtles/tt11.svg") as string
  },
  {
    id: "tt13",
    getName: () => _T("Turtle Name tt13"),
    imageData: require("app/ui/images/turtles/tt13.svg") as string
  }
];

@injectable()
export class TurtlesService {
  getAllTurtles(): TurtleInfo[] {
    return allTurtles;
  }

  getTurtleInfo(turtleId: string): TurtleInfo {
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
}
