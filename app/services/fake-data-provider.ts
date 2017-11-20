export class FakeDataProvider {
  public static getFakeAppConfig = () => require("app/../content/config/config.json");

  public static getRussianTranslation = () => require("app/../content/ru/messages.po");
}
