import * as React from "react";
import * as ReactDOM from "react-dom";
import * as goldenLayout from "golden-layout";
import { debounce } from "utils/debounce";

import { ReactGoldenLayoutPanel, Props as PanelProps } from "./react-golden-layout-panel";
import { GoldenLayoutHelper } from "./golden-layout.helper";
import { ReactGoldenLayoutHelperContext } from "./react-golden-layout-context";

export type GoldenLayoutConfig = goldenLayout.Config;

interface State {}

interface Props {
  className?: string;
  configLayoutOverride?: {
    settings?: goldenLayout.Settings;
    dimensions?: goldenLayout.Dimensions;
  };
  defaultLayoutConfigJSON: string;
  layoutLocalStorageKey?: string;
  onLayoutChange?(layoutJSON: string): void;
}

export class ReactGoldenLayout extends React.Component<Props, State> {
  private goldenLayoutContainerRef?: HTMLElement;
  private layoutHelper = new GoldenLayoutHelper();
  private panelDomContainersByIds: { [index: string]: HTMLElement } = {};
  private oldWindowDimensions = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  private isComponentMounted = false;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    const layoutFromStorage =
      this.props.layoutLocalStorageKey &&
      window.localStorage.getItem(this.props.layoutLocalStorageKey);
    if (!layoutFromStorage || !this.initLayoutWithConfig(layoutFromStorage)) {
      this.initLayoutWithConfig(this.props.defaultLayoutConfigJSON);
    }
    window.addEventListener("resize", this.onWindowResize);
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
    this.layoutHelper.destroy();
    window.removeEventListener("resize", this.onWindowResize);
  }

  onWindowResize = () => {
    if (
      this.oldWindowDimensions.width === window.innerWidth &&
      this.oldWindowDimensions.height > window.innerHeight + 100
    ) {
      // detected sharp reduction of window height - this must be a virtual keyboard toggled on
      // in this case we don't want to resize layout
      return;
    }

    this.oldWindowDimensions = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.layoutHelper.updateSize();
  };

  initLayoutWithConfig(goldenLayoutConfigJSON: string): boolean {
    try {
      const goldenLayoutConfig = JSON.parse(goldenLayoutConfigJSON) as goldenLayout.Config;
      if (this.props.configLayoutOverride) {
        goldenLayoutConfig.settings = {
          ...(goldenLayoutConfig.settings || {}),
          ...this.props.configLayoutOverride.settings
        };
        goldenLayoutConfig.dimensions = {
          ...(goldenLayoutConfig.dimensions || {}),
          ...this.props.configLayoutOverride.dimensions
        };
      }
      const layout = new goldenLayout(goldenLayoutConfig, this.goldenLayoutContainerRef);
      this.layoutHelper.setGoldenLayout(layout);
      const panelDomContainersByIds: { [key: string]: HTMLElement } = {};
      this.panelDomContainersByIds = panelDomContainersByIds;

      const registerComponentCallback = function (
        container: goldenLayout.Container,
        options: { componentName: string }
      ) {
        panelDomContainersByIds[options.componentName] = container.getElement().get(0);
      };

      const componentNames: string[] = [];
      React.Children.map(this.props.children, (child: React.ReactElement<PanelProps>) => {
        if (child.type != ReactGoldenLayoutPanel) {
          console.error("Wrong child:", child);
          throw new Error(
            "Invalid child, only ReactGoldenLayoutPanel are allowed as children, sorry"
          );
        }
        componentNames.push(child.props.id);
        layout.registerComponent(child.props.id, registerComponentCallback);
      });
      layout.init();

      // validate panels
      for (const componentName of componentNames) {
        const panelConfig = this.layoutHelper.findGoldenLayoutContentItem(
          layout.root,
          componentName
        );
        if (!panelConfig) {
          console.error("Oops, missing panel in config: " + componentName);
          return false;
        }
      }

      layout.on("stateChanged", this.handleLayoutStateChanged);
    } catch (ex) {
      console.error(ex);
      return false;
    }

    this.forceUpdate();
    return true;
  }

  handleLayoutStateChanged = debounce(() => {
    if (!this.isComponentMounted || !this.layoutHelper.layout) {
      return;
    }
    const config = this.layoutHelper.layout.toConfig();
    const json = JSON.stringify(config);

    if (this.props.layoutLocalStorageKey) {
      window.localStorage.setItem(this.props.layoutLocalStorageKey, json);
    }
    if (this.props.onLayoutChange) {
      this.props.onLayoutChange(json);
    }
  }, 500);

  render(): JSX.Element {
    return (
      <div
        className={this.props.className}
        ref={x => (this.goldenLayoutContainerRef = x || undefined)}
      >
        {this.layoutHelper.layout && (
          <ReactGoldenLayoutHelperContext.Provider value={this.layoutHelper}>
            {React.Children.map(this.props.children, (child: React.ReactElement<PanelProps>) => {
              const hostElement = this.panelDomContainersByIds[child.props.id];
              this.layoutHelper.setPanelTitle(child.props.id, child.props.title);
              if (hostElement) {
                return ReactDOM.createPortal(child, hostElement);
              }
              return undefined;
            })}
          </ReactGoldenLayoutHelperContext.Provider>
        )}
      </div>
    );
  }
}
