import * as React from "react";
import * as cn from "classnames";
import * as codemirror from "codemirror";
import { Observable, Subscription } from "rxjs";

import { ensure } from "app/utils/syntax-helpers";

import "node_modules/codemirror/addon/runmode/runmode.js";
import "node_modules/codemirror/addon/edit/closebrackets.js";
import "node_modules/codemirror/addon/edit/matchbrackets.js";
import "node_modules/codemirror/addon/display/placeholder.js";

import "app/../lib/codemirror-logo/cm-logo.js";

import "./code-input.component.less";

interface IComponentState {}

export interface ICodeInputComponentProps {
  className?: string;
  code: string;
  onHotkey?: (key: string) => void;
  onChanged: (code: string) => void;
  editorTheme: string;
  resizeEvents?: Observable<void>;
}

export class CodeInputComponent extends React.Component<ICodeInputComponentProps, IComponentState> {
  cm: codemirror.EditorFromTextArea;
  currentCode: string;
  subsriptions: Subscription[] = [];

  constructor(props: ICodeInputComponentProps) {
    super(props);

    this.state = {};
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps: ICodeInputComponentProps) {
    if (this.cm) {
      if (nextProps.code != this.currentCode) {
        this.currentCode = nextProps.code;
        this.cm.setValue(nextProps.code);
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
    this.cm.setValue(this.props.code);
    this.cm.on("change", () => {
      const newVal = this.cm.getValue();
      if (this.currentCode != newVal) {
        this.currentCode = newVal;
        this.props.onChanged(newVal);
      }
    });
    if (this.props.onHotkey) {
      const map = {
        F8: () => {
          ensure(this.props.onHotkey)("f8");
        },
        F9: () => {
          ensure(this.props.onHotkey)("f9");
        }
      };
      this.cm.addKeyMap(map);
    }

    if (this.props.resizeEvents) {
      this.subsriptions.push(
        this.props.resizeEvents.subscribe(() => {
          this.cm.refresh();
        })
      );
    }
  }

  componentWillUnmount() {
    this.subsriptions.forEach(s => s.unsubscribe());
  }

  render(): JSX.Element {
    return (
      <div className={cn("code-input-component", this.props.className)}>
        <textarea ref="text-area" />
      </div>
    );
  }
}
