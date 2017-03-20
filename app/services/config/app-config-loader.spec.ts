import { AppConfig } from "app/services/config/app-config";
import { AppConfigLoader } from "app/services/config/app-config-loader";

import { FakeAjaxService } from "app/services/infrastructure/ajax-service.fake";
import { FakeDataProvider } from "app/services/fake-data-provider";

describe('AppConfigLoader', () => {
    describe('should load config', () => {
        let config: AppConfig;
        beforeEach(() => {
            let fakeService = new FakeAjaxService({
                'content/config/config.json': FakeDataProvider.getFakeAppConfig()
            });
            let appConfigLoader = new AppConfigLoader(fakeService);
            return appConfigLoader.loadData().then(appConfig => {
                config = appConfig;
            });
        })

        it('which is not null', () => {
            chai.expect(config).to.be.not.null;
        })

        it('service baseUrl is defined', () => {
            chai.expect(config.services.appApiUrl).to.be.a('string');
        })
    })

    describe('should raise the validation exception', () => {
        function expectFail(setup: (conf: AppConfig) => void, assert: (err: Error) => void): any {
            let fakeConfig = FakeDataProvider.getFakeAppConfig();
            setup(fakeConfig);
            let fakeService = new FakeAjaxService({
                'content/config/config.json': fakeConfig
            });
            let appConfigLoader = new AppConfigLoader(fakeService);
            return appConfigLoader.loadData().should.eventually.rejected.satisfy((err: Error) => {
                assert(err);
                return true;
            });
        }

        it('if required attribute "baseUrl" is missing', () => {
            return expectFail(fakeConfig => {
                delete fakeConfig.services.appApiUrl;
            }, err => {
                chai.expect(err.message).to.contain("Missing required property: appApiUrl");
            });
        });
    });
})