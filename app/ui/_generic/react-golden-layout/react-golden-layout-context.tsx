import * as React from "react";
import { GoldenLayoutHelper } from "./golden-layout.helper";

export const ReactGoldenLayoutHelperContext: React.Context<GoldenLayoutHelper | undefined> = React.createContext(
  undefined
);
