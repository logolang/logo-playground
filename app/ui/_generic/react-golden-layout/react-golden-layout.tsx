import * as React from "react";
import * as ReactDOM from "react-dom";
import * as goldenLayout from "golden-layout";
import {
  ReactGoldenLayoutPanel,
  ReactGoldenLayoutPanelProps
} from "app/ui/_generic/react-golden-layout/react-golden-layout-panel";
import { GoldenLayoutHelper } from "./golden-layout.helper";
import { ReactGoldenLayoutHelperContext } from "app/ui/_generic/react-golden-layout/react-golden-layout-context";

export type GoldenLayoutConfig = goldenLayout.Config;

interface IComponentState {}

interface IComponentProps {
  className?: string;
  configLayoutOverride?: {
    settings?: goldenLayout.Settings;
    dimensions?: goldenLayout.Dimensions;
  };
  defaultLayoutConfigJSON: string;
  layoutLocalStorageKey?: string;
  onLayoutChange?(layoutJSON: string): void;
}

export class ReactGoldenLayout extends React.Component<IComponentProps, IComponentState> {
  private goldenLayoutContainerRef: HTMLElement | undefined;
  private layoutHelper = new GoldenLayoutHelper();
  private panelDomContainersByIds: { [index: string]: HTMLElement } = {};
  private stateChangedTimer: any;
  private oldWindowDimensions = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  constructor(props: IComponentProps) {
    super(props);
  }

  componentDidMount() {
    // we need this timeout because of goldenlayout component issues
    setTimeout(() => {
      const layoutFromStorage =
        this.props.layoutLocalStorageKey && window.localStorage.getItem(this.props.layoutLocalStorageKey);
      if (!layoutFromStorage || !this.initLayoutWithConfig(layoutFromStorage)) {
        this.initLayoutWithConfig(this.props.defaultLayoutConfigJSON);
      }
      window.addEventListener("resize", this.onWindowResize);
    });
  }

  componentWillUnmount() {
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
      this.panelDomContainersByIds = {};
      const $this = this;
      const registerComponentCallback = function(
        container: goldenLayout.Container,
        options: { componentName: string }
      ) {
        $this.panelDomContainersByIds[options.componentName] = container.getElement().get(0);
      };

      React.Children.map(this.props.children, (child: React.ReactElement<ReactGoldenLayoutPanelProps>) => {
        if (child.type != ReactGoldenLayoutPanel) {
          console.error("Wrong child:", child);
          throw new Error("Invalid child, only ReactGoldenLayoutPanel are allowed as children, sorry");
        }
        layout.registerComponent(child.props.id, registerComponentCallback);
      });
      layout.init();
      layout.on("stateChanged", this.onStateChanged);
    } catch (ex) {
      console.error(ex);
      return false;
    }

    this.forceUpdate();
    return true;
  }

  onStateChanged = () => {
    if (this.stateChangedTimer) {
      clearTimeout(this.stateChangedTimer);
    }
    this.stateChangedTimer = setTimeout(this.stateChangeHandler, 500);
  };

  stateChangeHandler = () => {
    const config = this.layoutHelper.layout.toConfig();
    const json = JSON.stringify(config);

    if (this.props.layoutLocalStorageKey) {
      window.localStorage.setItem(this.props.layoutLocalStorageKey, json);
    }
    if (this.props.onLayoutChange) {
      this.props.onLayoutChange(json);
    }
  };

  render(): JSX.Element {
    return (
      <div className={this.props.className} ref={x => (this.goldenLayoutContainerRef = x || undefined)}>
        {this.layoutHelper.layout && (
          <ReactGoldenLayoutHelperContext.Provider value={this.layoutHelper}>
            {React.Children.map(this.props.children, (child: React.ReactElement<ReactGoldenLayoutPanelProps>) => {
              const hostElement = this.panelDomContainersByIds[child.props.id];
              this.layoutHelper.setPanelTitle(child.props.id, child.props.title);
              if (hostElement) {
                return ReactDOM.createPortal(child, hostElement);
              }
              return;
            })}
          </ReactGoldenLayoutHelperContext.Provider>
        )}
      </div>
    );
  }
}
