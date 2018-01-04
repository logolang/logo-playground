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
      content: [
        {
          type: "stack",
          width: 100,
          height: 45,
          activeItemIndex: 0,
          content: [
            {
              title: "",
              type: "react-component",
              component: "tutorial-panel",
              componentName: "tutorial-panel",
              isClosable: false
            },
            {
              title: "",
              type: "react-component",
              component: "code-panel",
              componentName: "code-panel",
              isClosable: false
            }
          ]
        },
        {
          title: "",
          type: "react-component",
          component: "output-panel",
          componentName: "output-panel",
          height: 55,
          isClosable: false
        }
      ]
    }
  ]
};
