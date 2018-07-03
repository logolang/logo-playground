export const playgroundDefaultLayout = {
  content: [
    {
      type: "row",
      content: [
        {
          title: "",
          type: "component",
          componentName: "output-panel",
          width: 60
        },
        {
          title: "",
          type: "component",
          componentName: "code-panel",
          width: 40
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
          type: "component",
          componentName: "code-panel",
          height: 45
        },
        {
          title: "",
          type: "component",
          componentName: "output-panel",
          height: 55
        }
      ]
    }
  ]
};
