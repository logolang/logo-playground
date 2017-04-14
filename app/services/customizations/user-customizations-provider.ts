import { ServiceLocator } from "app/services/service-locator";
import { ThemeCustomizationsService } from "app/services/customizations/theme-customizations.service";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";

export interface IUserCustomizationsData {
    turtleImage: HTMLImageElement
    turtleSize: number
    turtleId: string
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
        const settings = await this.userSettings.get();
        const theme = this.themeCustomizations.getTheme(settings.themeName);
        const turtleInfo = this.turtleCustomizations.getTurtleInfo(settings.turtleId);
        const turtleImage = this.turtleCustomizations.getTurtleImage(turtleInfo);
        return {
            localeId: settings.localeId,
            turtleSize: settings.turtleSize,
            turtleId: settings.turtleId,
            turtleImage: turtleImage,
            isDark: theme.isDark,
            codeEditorTheme: theme.codemirror,
        }
    }
}