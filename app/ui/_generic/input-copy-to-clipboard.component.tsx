import * as React from "react";
import * as cn from "classnames";
import * as clipboard from "clipboard";
import { _T } from "app/services/customizations/localization.service";

interface IComponentProps {
  text: string;
  onCopied?: () => void;
}

interface IComponentState {
  isCopied: boolean;
}

let componentIncrementCounter = 0;

export class InputCopyToClipboardComponent extends React.Component<IComponentProps, IComponentState> {
  private clipboardInstance: clipboard;
  private componentId: string;

  constructor(props: IComponentProps) {
    super(props);
    this.componentId = "input-copy-to-clipboard-" + ++componentIncrementCounter;
    this.state = {
      isCopied: false
    };
  }

  async componentDidMount() {
    this.clipboardInstance = new clipboard("#" + this.componentId + "-btn");
    this.clipboardInstance.on("success", () => {
      this.setState({ isCopied: true });
      this.props.onCopied && this.props.onCopied();
    });
  }

  componentWillUnmount() {
    if (this.clipboardInstance) {
      this.clipboardInstance.destroy();
    }
  }

  render(): JSX.Element {
    console.log("yo! render");
    return (
      <div className="field has-addons">
        <div className="control is-expanded has-icons-right">
          <input id={this.componentId + "-url"} className="input" type="text" value={this.props.text} readOnly />
          {this.state.isCopied && (
            <span className="icon is-small is-right">
              <i className="fa fa-check" />
            </span>
          )}
        </div>
        <div className="control">
          <button
            id={this.componentId + "-btn"}
            type="button"
            className={cn("button", { "is-info": !this.state.isCopied })}
            data-clipboard-target={"#" + this.componentId + "-url"}
          >
            <i className="fa fa-clipboard" aria-hidden="true" />
            &nbsp;&nbsp;
            <span>{this.state.isCopied ? _T("Copied") : _T("Copy to clipboard")}</span>
          </button>
        </div>
      </div>
    );
  }
}
