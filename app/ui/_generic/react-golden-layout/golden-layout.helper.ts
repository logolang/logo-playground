import * as goldenLayout from "golden-layout";

export class GoldenLayoutHelper {
  layout: goldenLayout;

  public setGoldenLayout(layout: goldenLayout) {
    this.layout = layout;
  }

  public destroy() {
    if (this.layout) {
      this.layout.destroy();
    }
  }

  public updateSize() {
    if (this.layout) {
      this.layout.updateSize();
    }
  }

  public setPanelTitle(panelId: string, title: string) {
    const panelContentItem = this.findGoldenLayoutContentItem(this.layout.root, panelId);
    if (!panelContentItem) {
      console.log("Error: cannot find panel in layout: " + panelId);
      return;
    }
    panelContentItem.setTitle(title);
  }

  public findGoldenLayoutContentItem(
    root: goldenLayout.ContentItem,
    componentName: string
  ): goldenLayout.ContentItem | undefined {
    if (!root) {
      return undefined;
    }
    if ((root.config as any).componentName === componentName) {
      return root;
    }

    for (const child of root.contentItems) {
      const val = this.findGoldenLayoutContentItem(child, componentName);
      if (val) {
        return val;
      }
    }

    return undefined;
  }
}
