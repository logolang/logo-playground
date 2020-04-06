import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

// setup enzyme
configure({ adapter: new Adapter() });

Object.assign(global, { themesManagerGlobalInstance: {} });

console.log("Unit tests setup is done");
