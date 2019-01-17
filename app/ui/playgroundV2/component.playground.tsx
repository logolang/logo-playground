import * as React from "react";
import * as cn from "classnames";
import { Link } from "react-router-dom";

import { $T } from "app/i18n/strings";
import { resolveInject } from "app/di";
import { Routes } from "app/routes";
import { ProgramStorageType } from "app/services/program/program.model";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";
import { CodeInputLogoComponent } from "../_shared/code-input-logo.component";

interface IComponentProps {
  isLoading: boolean;
  storageType?: ProgramStorageType;
  programId?: string;
  code: string;
  programName: string;
  hasModifications: boolean;
  isRunning: boolean;
  loadProgram(storageType?: ProgramStorageType, programId?: string): void;
  codeChanged(code: string): void;
}

export class PlaygroundComponent extends React.Component<IComponentProps, {}> {
  private eventsTracker = resolveInject(EventsTrackingService);

  async componentDidMount() {
    this.eventsTracker.sendEvent(EventAction.openPlayground);
    this.props.loadProgram(this.props.storageType, this.props.programId);
  }

  async componentWillReceiveProps(newProps: IComponentProps) {
    if (newProps.storageType != this.props.storageType || newProps.programId != this.props.programId) {
      this.props.loadProgram(newProps.storageType, newProps.programId);
    }
  }

  handleCodeChanged = (code: string) => {
    this.props.codeChanged(code);
  };

  render(): JSX.Element {
    return (
      <div className="ex-page-container playground-component">
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            <p>
              {this.props.programName} {this.props.hasModifications && <span>*</span>}
            </p>
            <CodeInputLogoComponent
              className="code-input-container"
              editorTheme="eclipse"
              code={this.props.code}
              onChanged={this.handleCodeChanged}
            />
          </div>
        </div>
      </div>
    );
  }
}
