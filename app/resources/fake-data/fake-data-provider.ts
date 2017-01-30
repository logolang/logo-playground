import * as lodash from 'lodash';

import { RandomHelper } from 'app/utils/random-helper';
import { AppConfig } from 'app/model/config/app-config';

import { fakeUsers } from './users.fake';

export class FakeDataProvider {
    public static getFakeAppConfig = () =>
        lodash.cloneDeep(require<AppConfig>('app/config/config.json'));

    public static getFakeUsers = () =>
        lodash.cloneDeep(fakeUsers);
} 