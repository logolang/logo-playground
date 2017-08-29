import * as React from "react";
import * as $ from "jquery"; //required for goldenLayout
import * as goldenLayout from "golden-layout";
import { Subject } from "rxjs";

import "./golden-layout.component.scss";

interface Newable<T> {
  new (...args: any[]): T;
}
export type GoldenLayoutConfig = goldenLayout.Config;

export interface IPanelConfig<T, P> {
  componentName: string;
  componentType: Newable<T>;
  props: P;
  title: string;
}

interface IComponentState {}

interface IComponentProps {
  panels: IPanelConfig<any, any>[];
  layoutConfig: GoldenLayoutConfig;
  onLayoutChange: Subject<GoldenLayoutConfig>;
}

export class GoldenLayoutComponent extends React.Component<IComponentProps, IComponentState> {
  private layout: goldenLayout;

  constructor(props: IComponentProps) {
    super(props);
  }

  componentDidMount() {
    this.initLayout(this.props);
  }

  initLayout(props: IComponentProps) {
    const config = props.layoutConfig;

    for (const panel of props.panels) {
      const panelConfig = this.getGoldenLayoutConfigItem(panel.componentName, config);
      (panelConfig as any).props = panel.props;
    }
    config.settings = {
      showMaximiseIcon: false,
      showPopoutIcon: false,
      showCloseIcon: false
    };

    const element = this.refs["container"] as any;
    if (this.layout) {
      this.layout.destroy();
    }
    this.layout = new goldenLayout(config, element);
    for (const panel of props.panels) {
      this.layout.registerComponent(panel.componentName, panel.componentType);
    }
    this.layout.init();
    const layoutUnsafe: any = this.layout;
    layoutUnsafe.on("stateChanged", this.onStateChanged);

    this.setPanelTitles(this.props);
  }

  private setPanelTitles(props: IComponentProps) {
    for (const panel of props.panels) {
      const panelContentItem = this.findGoldenLayoutContentItem(this.layout.root, panel.componentName);
      if (!panelContentItem) {
        console.log("Error: cannot find panel in layout: " + panelContentItem);
        return;
      }
      panelContentItem.setTitle(panel.title);
    }
  }

  onStateChanged = () => {
    const config = this.layout.toConfig();
    // erase props from config layout
    for (const panel of this.props.panels) {
      const codePanelConfig = this.getGoldenLayoutConfigItem(panel.componentName, config);
      (codePanelConfig as any).props = {};
    }
    this.props.onLayoutChange.next(config);
  };

  componentWillUnmount() {
    //console.log('page-layout unmount')
    if (this.layout) {
      this.layout.destroy();
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render(): JSX.Element {
    return <div ref="container" />;
  }

  private getGoldenLayoutConfigItem(type: string, config: goldenLayout.Config): goldenLayout.ItemConfigType {
    const item = this.findGoldenLayoutConfigItem(type, config.content);
    if (item) {
      return item;
    } else {
      throw new Error(`Cannot find element ${type} in golden layout config`);
    }
  }

  private findGoldenLayoutContentItem(
    root: goldenLayout.ContentItem,
    componentName: string
  ): goldenLayout.ContentItem | undefined {
    if (!root) {
      return undefined;
    }
    if ((root.config as any).component === componentName) {
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

  private findGoldenLayoutConfigItem(
    componentName: string,
    content?: goldenLayout.ItemConfigType[]
  ): goldenLayout.ItemConfigType | undefined {
    if (content) {
      for (const item of content) {
        if ((item as any).component === componentName) {
          return item;
        }
        if (item.content) {
          const res = this.findGoldenLayoutConfigItem(componentName, item.content);
          if (res) {
            return res;
          }
        }
      }
    }
    return undefined;
  }
}
