import * as lodash from "lodash";

export class FakeDataProvider {
  public static getFakeAppConfig = () => lodash.cloneDeep(require("app/../content/config/config.json"));

  public static getRussianTranslation = () => lodash.cloneDeep(require("app/../content/ru/messages.po"));
}
