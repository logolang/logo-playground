import * as React from "react";
import * as cn from "classnames";
import { Collapse } from "react-bootstrap";

interface IComponentState {
  collapsed: boolean;
}

interface IComponentProps {
  title: string;
  collapsed: boolean;
  bsStyle?: string;
}

export class CollapsiblePanelComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      collapsed: this.props.collapsed
    };
  }

  render(): JSX.Element {
    return (
      <div className={`panel panel-${this.props.bsStyle || "default"}`}>
        <div
          className="panel-heading"
          onClick={() =>
            this.setState({
              collapsed: !this.state.collapsed
            })}
        >
          <span>
            {this.props.title}
          </span>
          <span className="ex-noselect">&nbsp;</span>
          <small>
            <span
              className={cn("glyphicon", {
                "glyphicon-menu-down": this.state.collapsed,
                "glyphicon-menu-up": !this.state.collapsed
              })}
            />
          </small>
        </div>
        <Collapse in={!this.state.collapsed}>
          <div>
            <div className="panel-body">
              {this.props.children}
            </div>
          </div>
        </Collapse>
      </div>
    );
  }
}
