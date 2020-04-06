import { GoldenLayoutConfig } from "ui/_generic/react-golden-layout/react-golden-layout";

export const tutorialsDefaultLayout: GoldenLayoutConfig = {
  content: [
    {
      type: "row",
      content: [
        {
          isClosable: false,
          title: "",
          type: "component",
          componentName: "tutorial-panel",
          width: 40
        },
        {
          type: "column",
          width: 60,
          content: [
            {
              isClosable: false,
              title: "",
              type: "component",
              componentName: "output-panel",
              height: 60
            },
            {
              isClosable: false,
              title: "",
              type: "component",
              componentName: "code-panel",
              height: 40
            }
          ]
        }
      ]
    }
  ]
};

export const tutorialsDefaultMobileLayout: GoldenLayoutConfig = {
  settings: {
    reorderEnabled: false
  },
  content: [
    {
      type: "column",
      content: [
        {
          type: "stack",
          width: 100,
          height: 55,
          content: [
            {
              isClosable: false,
              title: "",
              type: "component",
              componentName: "tutorial-panel"
            },
            {
              isClosable: false,
              title: "",
              type: "component",
              componentName: "code-panel"
            }
          ]
        },
        {
          type: "stack",
          height: 45,
          content: [
            {
              isClosable: false,
              title: "",
              type: "component",
              componentName: "output-panel"
            }
          ]
        }
      ]
    }
  ]
};
