export const tutorialsDefaultLayout = {
  content: [
    {
      type: "row",
      content: [
        {
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
              title: "",
              type: "component",
              componentName: "output-panel",
              height: 60
            },
            {
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
          height: 55,
          activeItemIndex: 0,
          content: [
            {
              title: "",
              type: "component",
              componentName: "tutorial-panel"
            },
            {
              title: "",
              type: "component",
              componentName: "code-panel"
            }
          ]
        },
        {
          type: "stack",
          height: 45,
          activeItemIndex: 0,
          content: [
            {
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
