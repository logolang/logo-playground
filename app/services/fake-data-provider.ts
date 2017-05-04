import * as lodash from 'lodash';

import { RandomHelper } from 'app/utils/random-helper';
import { AppConfig } from "app/services/config/app-config";

export class FakeDataProvider {
    public static getFakeAppConfig = () =>
        lodash.cloneDeep(require('app/../content/config/config.json'));

    public static getRussianTranslation = () =>
        lodash.cloneDeep(require('app/../content/ru/messages.po'));
} 