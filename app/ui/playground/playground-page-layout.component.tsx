import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery";
import { Observable } from "rxjs";

//Expose react and react router in order for golden layout work
(window as any)["React"] = React;
(window as any)["ReactDOM"] = ReactDOM;
import * as goldenLayout from "golden-layout";

import { CodePanelComponent, ICodePanelComponentProps } from "./code-panel.component";
import { OutputPanelComponent, IOutputPanelComponentProps } from "./output-panel.component";

import { lazyInject } from "app/di";
import { _T } from "app/services/customizations/localization.service";
import { ProgramModel } from "app/services/gallery/program.model";
import { IUserDataService } from "app/services/customizations/user-data.service";

import "./playground-page-layout.component.scss";

interface IComponentState {}

interface IComponentProps {
  program: ProgramModel;
  codePanelProps: ICodePanelComponentProps;
  outputPanelProps: IOutputPanelComponentProps;
}

export class PlaygroundPageLayoutComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(IUserDataService) private userDataService: IUserDataService;

  private layout: goldenLayout;
  private readonly defaultConfig: goldenLayout.Config = {
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
  private config: goldenLayout.Config = this.defaultConfig;

  constructor(props: IComponentProps) {
    super(props);
  }

  componentDidMount() {
    //console.log('page-layout mount')
    this.initLayout(this.props);
  }

  componentWillReceiveProps(newProps: IComponentProps) {
    if (newProps.program.id === this.props.program.id) {
      // We have changes in current program - skip layout updating
      return;
    }
    if (newProps.codePanelProps.codeInputProps.code === this.props.codePanelProps.codeInputProps.code) {
      if (newProps.program.name === this.props.program.name) {
        //Nothing relevant changed
        return;
      } else {
        // Program name is changed but code is not
        this.setCodePanelTitle(newProps);
      }
    } else {
      // Refresh whole layout for now, but ideally should change only program and title and reset graphics
      this.initLayout(newProps);
    }
  }

  async initLayout(props: IComponentProps) {
    try {
      const storedState = await this.userDataService.getPlaygroundLayoutJSON();
      if (storedState) {
        this.config = JSON.parse(storedState);
      }
    } catch (ex) {
      console.error("Error while getting stored layout state", ex);
    }

    // Set props for components in Golden-Layout
    const codePanelConfig = this.getGoldenLayoutConfigItem("code-panel", this.config);
    (codePanelConfig as any).props = this.props.codePanelProps;

    const outputPanelConfig = this.getGoldenLayoutConfigItem("output-panel", this.config);
    (outputPanelConfig as any).props = this.props.outputPanelProps;

    this.config.settings = {
      showMaximiseIcon: false,
      showPopoutIcon: false,
      showCloseIcon: false
    };

    const element = this.refs["container"] as any;
    if (this.layout) {
      this.layout.destroy();
    }
    this.layout = new goldenLayout(this.config, element);
    this.layout.registerComponent("code-panel", CodePanelComponent);
    this.layout.registerComponent("output-panel", OutputPanelComponent);
    this.layout.init();
    const layoutUnsafe: any = this.layout;
    layoutUnsafe.on("stateChanged", this.saveState);

    $(document.body).addClass("full-page-body");

    this.setCodePanelTitle(this.props);
  }

  private setCodePanelTitle(props: IComponentProps) {
    const codePanel = this.findGoldenLayoutContentItem(this.layout.root, "code-panel");
    if (!codePanel) {
      console.log("Error: cannot find code panel in layout");
      return;
    }
    const outPanel = this.findGoldenLayoutContentItem(this.layout.root, "output-panel");
    if (!outPanel) {
      console.log("Error: cannot find output panel in layout");
      return;
    }
    codePanel.setTitle(props.program.name);
    outPanel.setTitle(_T("Output"));
  }

  saveState = () => {
    const config = this.layout.toConfig();
    const codePanelConfig = this.getGoldenLayoutConfigItem("code-panel", config);
    (codePanelConfig as any).props = {};

    const outputPanelConfig = this.getGoldenLayoutConfigItem("output-panel", config);
    (outputPanelConfig as any).props = {};

    this.userDataService.setPlaygroundLayoutJSON(JSON.stringify(config));
  };

  componentWillUnmount() {
    //console.log('page-layout unmount')
    if (this.layout) {
      this.layout.destroy();
    }
    $(document.body).removeClass("full-page-body");
  }

  shouldComponentUpdate() {
    return false;
  }

  render(): JSX.Element {
    return <div className="full-page" ref="container" />;
  }

  private getGoldenLayoutConfigItem(type: string, config: goldenLayout.Config): goldenLayout.ItemConfigType {
    let item = this.findGoldenLayoutConfigItem(type, config.content);
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
    content: goldenLayout.ItemConfigType[]
  ): goldenLayout.ItemConfigType | undefined {
    if (content) {
      for (let item of content) {
        if ((item as any).component === componentName) {
          return item;
        }
        if (item.content) {
          let res = this.findGoldenLayoutConfigItem(componentName, item.content);
          if (res) {
            return res;
          }
        }
      }
    }
    return undefined;
  }
}
