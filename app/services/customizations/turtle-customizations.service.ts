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
    private localStorageTurtleName = new LocalStorageService<string>(appInfo.name + ":" + appInfo.version + ":turtleName", 'T9');
    private localStorageTurtleSize = new LocalStorageService<number>(appInfo.name + ":" + appInfo.version + ":turtleSize", 40);

    getAllTurtles(): TurtleInfo[] {
        return allTurtles;
    }

    getCurrentTurtleSize() {
        return this.localStorageTurtleSize.getValue();
    }

    getCurrentTurtleInfo(): TurtleInfo {
        const name = this.localStorageTurtleName.getValue();
        let turtleData = allTurtles.find(t => t.name === name);
        if (!turtleData) {
            turtleData = allTurtles[0];
            this.localStorageTurtleName.setValue(turtleData.name);
        }
        return turtleData;
    }

    getCurrentTurtleImage(): HTMLImageElement {
        let turtleData = this.getCurrentTurtleInfo();

        const img = new Image();
        img.width = 512;
        img.height = 512;
        img.src = turtleData.imageData;
        return img;
    }

    setCurrentTurtle(name: string, size: number) {
        this.localStorageTurtleName.setValue(name);
        this.localStorageTurtleSize.setValue(size);
    }
}