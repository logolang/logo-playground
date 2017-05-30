import { ThemeCustomizationsService } from "app/services/customizations/theme-customizations.service";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";
import { injectable, inject } from "app/di";
import { IUserSettingsService } from "app/services/customizations/user-settings.service";

export interface IUserCustomizationsData {
    turtleImage: HTMLImageElement
    turtleSize: number
    turtleId: string
    codeEditorTheme: string
    isDark: boolean
    localeId: string
}

@injectable()
export class UserCustomizationsProvider {
    constructor(
        @inject(IUserSettingsService) private userSettings: IUserSettingsService,
        @inject(ThemeCustomizationsService) private themeCustomizations: ThemeCustomizationsService,
        @inject(TurtleCustomizationsService) private turtleCustomizations: TurtleCustomizationsService,
    ) {
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