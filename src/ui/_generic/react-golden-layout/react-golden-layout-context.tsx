import * as React from "react";
import { GoldenLayoutHelper } from "./golden-layout.helper";

/**
 * This react context is used to share access to instance of GoldenLayoutHelper for parent component and sub-components
 */
export const ReactGoldenLayoutHelperContext = React.createContext<GoldenLayoutHelper | undefined>(
  undefined
);
