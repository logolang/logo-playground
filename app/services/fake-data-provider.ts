import * as lodash from 'lodash';

import { RandomHelper } from 'app/utils/random-helper';
import { AppConfig } from "app/services/config/app-config";
import { fakeUsers } from "app/services/login/users.fake";

export class FakeDataProvider {
    public static getFakeAppConfig = () =>
        lodash.cloneDeep(require<AppConfig>('app/../content/config/config.json'));

    public static getFakeUsers = () =>
        lodash.cloneDeep(fakeUsers);

    public static getRussianTranslation = () =>
        lodash.cloneDeep(require<any>('app/../content/ru/messages.po'));
} 