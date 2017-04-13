import { ServiceLocator } from "app/services/service-locator";
import { ThemeCustomizationsService } from "app/services/customizations/theme-customizations.service";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";

export interface IUserCustomizationsData {
    customTurtle: HTMLImageElement
    customTurtleSize: number
    customTurtleName: string
    codeEditorTheme: string
    isDark: boolean
    localeId: string
}

export class UserCustomizationsProvider {
    private userSettings = ServiceLocator.resolve(x => x.userSettingsService);
    private themeCustomizations = new ThemeCustomizationsService();
    private turtleCustomizations = new TurtleCustomizationsService();

    constructor() {
    }

    async getCustomizationsData(): Promise<IUserCustomizationsData> {
        const settings = await this.userSettings.getAll();
        const theme = this.themeCustomizations.getTheme(settings.themeName);
        const turtleInfo = this.turtleCustomizations.getTurtleInfo(settings.turtleName);
        const turtleImage = this.turtleCustomizations.getTurtleImage(turtleInfo);
        return {
            customTurtleSize: settings.turtleSize,
            customTurtleName: settings.turtleName,
            customTurtle: turtleImage,
            isDark: theme.isDark,
            codeEditorTheme: theme.codemirror,
            localeId: settings.localeId
        }
    }
}