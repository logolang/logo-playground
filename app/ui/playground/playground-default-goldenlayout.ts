export const playgroundDefaultLayout = {
  content: [
    {
      type: "row",
      content: [
        {
          title: "",
          type: "react-component",
          component: "output-panel",
          componentName: "output-panel",
          width: 60,
          isClosable: false
        },
        {
          title: "",
          type: "react-component",
          component: "code-panel",
          componentName: "code-panel",
          width: 40,
          isClosable: false
        }
      ]
    }
  ]
};

export const playgroundDefaultMobileLayout = {
  settings: {
    reorderEnabled: false
  },
  content: [
    {
      type: "column",
      content: [
        {
          title: "",
          type: "react-component",
          component: "code-panel",
          componentName: "code-panel",
          height: 45,
          isClosable: false
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
