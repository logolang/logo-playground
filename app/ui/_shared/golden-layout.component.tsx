import * as React from "react";
import * as goldenLayout from "golden-layout";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import "./golden-layout.component.less";
import { checkIsMobileDevice } from "app/utils/device-helper";

interface Newable<T> {
  new (...args: any[]): T;
}
export type GoldenLayoutConfig = goldenLayout.Config;

export interface IPanelConfig<T, P> {
  componentName: string;
  componentType: Newable<T>;
  props: P;
  title: BehaviorSubject<string>;
}

interface IComponentState {}

interface IComponentProps {
  panels: IPanelConfig<any, any>[];
  defaultLayoutConfigJSON: string;
  initialLayoutConfigJSON?: string;
  onLayoutChange(newConfigJSON: string): void;
  panelsReloadCheck(oldPanels: IPanelConfig<any, any>[], newPanels: IPanelConfig<any, any>[]): boolean;
}

export class GoldenLayoutComponent extends React.Component<IComponentProps, IComponentState> {
  private layout: goldenLayout;
  private stateChangedTimer: any;
  private stateLastJSON: string;
  private oldWindowDimensions = { width: window.innerWidth, height: window.innerHeight };

  constructor(props: IComponentProps) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.initLayout(this.props);
    window.addEventListener("resize", this.onWindowResize);
  }

  componentWillUnmount() {
    //console.log('page-layout unmount')
    if (this.layout) {
      this.layout.destroy();
    }
    window.removeEventListener("resize", this.onWindowResize);
  }

  componentWillReceiveProps(nextProps: IComponentProps) {
    if (this.props.panelsReloadCheck(this.props.panels, nextProps.panels)) {
      this.initLayout(nextProps);
    }
  }

  onWindowResize = () => {
    if (checkIsMobileDevice()) {
      if (
        this.oldWindowDimensions.width === window.innerWidth &&
        this.oldWindowDimensions.height > window.innerHeight + 100
      ) {
        // detected sharp reduction of window height - this must be a virtual keyboard toggled on
        // in this case we don't want to resize layout
        return;
      }
    }
    this.oldWindowDimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    if (this.layout) {
      this.layout.updateSize();
    }
  };

  initLayout(props: IComponentProps) {
    setTimeout(() => {
      try {
        this.initLayoutWithConfig(props, JSON.parse(props.initialLayoutConfigJSON || ""));
      } catch (ex) {
        this.initLayoutWithConfig(props, JSON.parse(props.defaultLayoutConfigJSON));
      }
    }, 0);
  }

  initLayoutWithConfig(props: IComponentProps, configToApply?: object) {
    if (!configToApply) {
      throw new Error("configToApply should be not undefined");
    }
    const config = this.layout ? this.layout.toConfig() : configToApply;
    for (const panel of props.panels) {
      const panelConfig = this.getGoldenLayoutConfigItem(panel.componentName, config);
      (panelConfig as any).props = panel.props;
      (panelConfig as any).componentState = {};
    }
    config.settings = {
      ...(config.settings || {}),
      ...{
        showMaximiseIcon: false,
        showPopoutIcon: false,
        showCloseIcon: false
      }
    };
    config.dimensions = {
      headerHeight: 32
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
    this.layout.on("stateChanged", this.onStateChanged);

    this.setPanelTitles(props);
  }

  private setPanelTitles(props: IComponentProps) {
    for (const panel of props.panels) {
      const panelContentItem = this.findGoldenLayoutContentItem(this.layout.root, panel.componentName);
      if (!panelContentItem) {
        console.log("Error: cannot find panel in layout: " + panelContentItem);
        return;
      }
      panelContentItem.setTitle(panel.title.value);
      panel.title.subscribe(newTitle => {
        panelContentItem.setTitle(newTitle);
      });
    }
  }

  onStateChanged = () => {
    if (this.stateChangedTimer) {
      clearTimeout(this.stateChangedTimer);
    }
    this.stateChangedTimer = setTimeout(this.stateChangeHandler, 500);
  };

  stateChangeHandler = () => {
    const config = this.layout.toConfig();
    this.scanObjAndSetProps(config, {
      props: undefined,
      componentState: undefined,
      title: "Panel"
    });
    const json = JSON.stringify(config);
    if (this.stateLastJSON != json) {
      this.stateLastJSON = json;
      this.props.onLayoutChange(json);
    }
  };

  scanObjAndSetProps(obj: any, propsToSet: any) {
    for (const [k, v] of Object.entries(obj)) {
      if (propsToSet.hasOwnProperty(k)) {
        obj[k] = propsToSet[k];
      } else {
        if (typeof v === "object" && v) {
          this.scanObjAndSetProps(v, propsToSet);
        }
      }
    }
  }

  render(): JSX.Element {
    return <div className="golden-layout-component" ref="container" />;
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
