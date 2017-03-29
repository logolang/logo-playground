import { LocalStorageService } from "app/services/infrastructure/local-storage.service";

export interface TurtleInfo {
    name: string
    imageData: string
}

const allTurtles: TurtleInfo[] = [
    {
        name: 'Bright Runner',
        imageData: require('app/ui/images/turtles/tt12.svg') as string
    },
    {
        name: 'Princess',
        imageData: require('app/ui/images/turtles/tt9.svg') as string
    },
    {
        name: 'Chilly Bob',
        imageData: require('app/ui/images/turtles/tt10.svg') as string
    },
    {
        name: 'Summer',
        imageData: require('app/ui/images/turtles/tt11.svg') as string
    },
    {
        name: 'Deep Diver',
        imageData: require('app/ui/images/turtles/tt13.svg') as string
    }
]

export class TurtleCustomizationsService {
    getAllTurtles(): TurtleInfo[] {
        return allTurtles;
    }

    getTurtleInfo(turtleName: string): TurtleInfo {
        let turtleData = allTurtles.find(t => t.name === turtleName);
        if (!turtleData) {
            turtleData = allTurtles[0];
        }
        return turtleData;
    }

    getTurtleImage(turtleInfo: TurtleInfo): HTMLImageElement {
        const img = new Image();
        img.width = 512;
        img.height = 512;
        img.src = turtleInfo.imageData;
        return img;
    }
}