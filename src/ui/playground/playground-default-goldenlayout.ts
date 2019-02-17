import { GoldenLayoutConfig } from "ui/_generic/react-golden-layout/react-golden-layout";

export const playgroundDefaultLayout: GoldenLayoutConfig = {
  content: [
    {
      type: "row",
      content: [
        {
          isClosable: false,
          title: "",
          type: "component",
          componentName: "output-panel",
          width: 60
        },
        {
          isClosable: false,
          title: "",
          type: "component",
          componentName: "code-panel",
          width: 40
        }
      ]
    }
  ]
};

export const playgroundDefaultMobileLayout: GoldenLayoutConfig = {
  settings: {
    reorderEnabled: false
  },
  content: [
    {
      type: "column",
      content: [
        {
          isClosable: false,
          title: "",
          type: "component",
          componentName: "code-panel",
          height: 45
        },
        {
          isClosable: false,
          title: "",
          type: "component",
          componentName: "output-panel",
          height: 55
        }
      ]
    }
  ]
};
