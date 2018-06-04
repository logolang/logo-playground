export const tutorialsDefaultLayout = {
  content: [
    {
      type: "row",
      content: [
        {
          title: "",
          type: "react-component",
          component: "tutorial-panel",
          componentName: "tutorial-panel",
          width: 40,
          isClosable: false
        },
        {
          type: "column",
          width: 60,
          content: [
            {
              title: "",
              type: "react-component",
              component: "output-panel",
              componentName: "output-panel",
              height: 60,
              isClosable: false
            },
            {
              title: "",
              type: "react-component",
              component: "code-panel",
              componentName: "code-panel",
              height: 40,
              isClosable: false
            }
          ]
        }
      ]
    }
  ]
};

export const tutorialsDefaultMobileLayout = {
  settings: {
    reorderEnabled: false
  },
  content: [
    {
      type: "column",
      isClosable: true,
      title: "",
      content: [
        {
          type: "stack",
          width: 100,
          height: 57.046411353202295,
          activeItemIndex: 0,
          isClosable: true,
          title: "",
          content: [
            {
              title: "Tutorial",
              type: "component",
              component: "tutorial-panel",
              componentName: "lm-react-component",
              isClosable: false
            },
            {
              title: "Code",
              type: "component",
              component: "code-panel",
              componentName: "lm-react-component",
              isClosable: false
            }
          ]
        },
        {
          type: "stack",
          height: 42.953588646797705,
          isClosable: true,
          title: "",
          activeItemIndex: 0,
          content: [
            {
              title: "Output",
              type: "component",
              component: "output-panel",
              componentName: "lm-react-component",
              height: 55,
              isClosable: false
            }
          ]
        }
      ]
    }
  ]
};
