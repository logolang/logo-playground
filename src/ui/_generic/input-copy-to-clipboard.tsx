import * as React from "react";
import * as cn from "classnames";
import * as clipboard from "clipboard";
import { $T } from "i18n-strings";

interface Props {
  text: string;
  onCopied?(): void;
}

interface State {
  isCopied: boolean;
}

let componentIncrementCounter = 0;

export class InputCopyToClipboard extends React.Component<Props, State> {
  private clipboardInstance: clipboard;
  private componentId: string;

  constructor(props: Props) {
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
    return (
      <>
        <div className="field">
          <div className="control has-icons-right">
            <input
              id={this.componentId + "-url"}
              className="input"
              type="text"
              value={this.props.text}
              readOnly
            />
            {this.state.isCopied && (
              <span className="icon is-small is-right">
                <i className="fa fa-check" />
              </span>
            )}
          </div>
        </div>
        <div className="field">
          <button
            id={this.componentId + "-btn"}
            type="button"
            className={cn("button", { "is-info": !this.state.isCopied })}
            data-clipboard-target={"#" + this.componentId + "-url"}
          >
            <i className="fa fa-clipboard" aria-hidden="true" />
            &nbsp;&nbsp;
            <span>{this.state.isCopied ? $T.common.copied : $T.common.copyToClipboard}</span>
          </button>
        </div>
      </>
    );
  }
}
