import * as React from "react";
import * as cn from "classnames";
import * as codemirror from "codemirror";
import * as keymaster from "keymaster";
import { debounce } from "utils/debounce";

import "node_modules/codemirror/addon/runmode/runmode.js";
import "node_modules/codemirror/addon/edit/closebrackets.js";
import "node_modules/codemirror/addon/edit/matchbrackets.js";
import "node_modules/codemirror/addon/display/placeholder.js";

import "app/../lib/codemirror-logo/cm-logo.js";

import "./code-input.less";

interface State {}

export interface Props {
  className?: string;
  code: string;
  onChanged(code: string): void;
  editorTheme: string;
  hotKeys?: string[];
  onHotkey?(hotkey: string): void;
  resizeIncrement?: any;
}

export class CodeInput extends React.Component<Props, State> {
  cm: codemirror.EditorFromTextArea;

  /*
  Store current code text in a variable allows to avoid 
  unnecessary coremirror text updates and cursor jumps
  */
  currentCode: string;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps: Props) {
    if (this.cm) {
      if (this.currentCode != this.props.code) {
        this.currentCode = this.props.code;
        this.cm.setValue(this.currentCode);
      }
      if (prevProps.resizeIncrement != this.props.resizeIncrement) {
        this.cm.refresh();
      }
    }
  }

  componentDidMount() {
    const textArea = this.refs["text-area"] as HTMLTextAreaElement;

    const BRACKETS = "()[]{}";
    this.cm = codemirror.fromTextArea(textArea, {
      mode: "logo",
      autoCloseBrackets: { pairs: BRACKETS, explode: BRACKETS },
      matchBrackets: true,
      lineComment: ";",
      lineNumbers: true,
      lineWrapping: true,
      theme: this.props.editorTheme
    } as any);
    this.cm.setSize("100%", "100%");
    this.currentCode = this.props.code;
    this.cm.setValue(this.currentCode);
    this.cm.on("change", () => {
      const newVal = this.cm.getValue();
      if (this.currentCode != newVal) {
        this.currentCode = newVal;
        this.props.onChanged(newVal);
      }
    });

    if (this.props.hotKeys) {
      const keyMap: codemirror.KeyMap = {};
      for (const hotkey of this.props.hotKeys) {
        keyMap[hotkey.toUpperCase()] = () => {
          this.handleHotkey(hotkey);
        };
        keymaster(hotkey, () => {
          this.handleHotkey(hotkey);
          return false;
        });
      }
      this.cm.addKeyMap(keyMap);
    }

    window.addEventListener("resize", this.handleWindowResize);
  }

  componentWillUnmount() {
    if (this.props.hotKeys) {
      for (const hotkey of this.props.hotKeys) {
        keymaster.unbind(hotkey);
      }
    }
    window.removeEventListener("resize", this.handleWindowResize);
  }

  handleHotkey = (hotkey: string) => {
    this.props.onHotkey && this.props.onHotkey(hotkey);
  };

  handleWindowResize = debounce(() => {
    if (this.cm) {
      this.cm.refresh();
    }
  }, 300);

  render(): JSX.Element {
    return (
      <div className={cn("code-input-component", this.props.className)}>
        <textarea ref="text-area" />
      </div>
    );
  }
}
