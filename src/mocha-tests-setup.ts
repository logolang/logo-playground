import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

// setup enzyme
configure({ adapter: new Adapter() });

console.log("Unit tests setup is done");
