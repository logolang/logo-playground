import { LocalizationService, _T } from "app/services/customizations/localization.service";
import { FakeDataProvider } from "app/services/fake-data-provider";

describe('Localization service', () => {
    beforeEach(() => {
        const localizationService = new LocalizationService();
        localizationService.initLocale(FakeDataProvider.getRussianTranslation());
    })

    it('should translate simple key properly', () => {
        chai.expect(_T("App title")).to.eql("Песочница Лого");
    })

    it('should get a default value for a simple key properly', () => {
        chai.expect(_T("Not defined value")).to.eql("Not defined value");
    })

    it('should translate plural properly', () => {
        const getLocalizedString = (n: number) =>
            _T("You have %d program", { plural: "You have %d programs", value: n });

        chai.expect(getLocalizedString(0)).to.eql("У вас 0 программ");
        chai.expect(getLocalizedString(1)).to.eql("У вас 1 программа");
        chai.expect(getLocalizedString(2)).to.eql("У вас 2 программы");
        chai.expect(getLocalizedString(4)).to.eql("У вас 4 программы");
        chai.expect(getLocalizedString(5)).to.eql("У вас 5 программ");
        chai.expect(getLocalizedString(100)).to.eql("У вас 100 программ");
        chai.expect(getLocalizedString(101)).to.eql("У вас 101 программа");
        chai.expect(getLocalizedString(102)).to.eql("У вас 102 программы");
    })

    it('should get a default value for a plural properly', () => {
        const getLocalizedString = (n: number) =>
            _T("There is a %d bug in your code", { plural: "There are %d bugs in your code", value: n });

        chai.expect(getLocalizedString(0)).to.eql("There are 0 bugs in your code");
        chai.expect(getLocalizedString(1)).to.eql("There is a 1 bug in your code");
        chai.expect(getLocalizedString(2)).to.eql("There are 2 bugs in your code");
    })
})
