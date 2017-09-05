import * as React from "react";
import { ISubscription } from "rxjs/Subscription";

import { as } from "app/utils/syntax-helpers";
import { lazyInject } from "app/di";

import { INotificationService } from "app/services/infrastructure/notification.service";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import { ProgramManagementService, IProgramToSaveAttributes } from "app/services/program/program-management.service";

import { ShareScreenshotModalComponent } from "app/ui/playground/share-screenshot-modal.component";
import { CodeInputLogoComponent, ICodeInputComponentProps } from "app/ui/_shared/code-input-logo.component";
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";

import "./code-panel.component.scss";
import { _T } from "app/services/customizations/localization.service";
import { ProgramModel } from "app/services/program/program.model";

export interface ICodePanelComponentProps {
  editorTheme: string;
  executionService: ProgramExecutionService;
  managementService: ProgramManagementService;
  program: ProgramModel;
  isFromGallery: boolean;
}

interface IComponentState {
  isSaveModalActive: boolean;
  screenshotDataToSave: string;
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, IComponentState> {
  @lazyInject(INotificationService) private notificationService: INotificationService;
  private subscriptions: ISubscription[] = [];

  constructor(props: ICodePanelComponentProps) {
    super(props);
    this.state = {
      isSaveModalActive: false,
      screenshotDataToSave: ""
    };
  }

  componentDidMount() {
    this.subscriptions.push(
      this.props.executionService.onIsRunningChanged.subscribe(() => {
        // Update state to force a component render
        this.setState({});
      })
    );
    this.subscriptions.push(
      this.props.executionService.codeChangesStream.subscribe(change => {
        if (change.source === "external") {
          this.setState({});
        }
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  render(): JSX.Element {
    const execService = this.props.executionService;
    return (
      <div className="code-panel-container">
        {this.renderSaveModal()}
        {this.state.screenshotDataToSave && (
          <ShareScreenshotModalComponent
            imageBase64={this.state.screenshotDataToSave}
            onClose={() => {
              this.setState({ screenshotDataToSave: "" });
            }}
          />
        )}

        <ProgramControlsMenuComponent
          isRunning={execService.isRunning}
          existingProgramName={execService.programName}
          runProgram={execService.runCurrentProgram}
          stopProgram={execService.stopCurrentProgram}
          exportImage={this.exportScreenshot}
          saveAsNew={this.showSaveDialog}
          saveCurrent={this.props.isFromGallery ? this.saveCurrentProgram : undefined}
        />
        {React.createElement(
          CodeInputLogoComponent,
          as<ICodeInputComponentProps>({
            className: "code-input-container",
            editorTheme: this.props.editorTheme,
            code: execService.code,
            focusCommands: execService.focusCommands,
            onChanged: this.onCodeChanged,
            onHotkey: execService.runCurrentProgram
          })
        )}
      </div>
    );
  }

  onCodeChanged = (newCode: string) => {
    this.props.executionService.updateCode(newCode, "internal");
  };

  renderSaveModal(): JSX.Element | null {
    if (this.state.isSaveModalActive) {
      return (
        <SaveProgramModalComponent
          code={this.props.executionService.code}
          programName={this.props.executionService.programName}
          onClose={() => {
            this.setState({ isSaveModalActive: false });
          }}
          onSave={this.saveProgramAsCallback}
        />
      );
    }
    return null;
  }

  showSaveDialog = () => {
    this.setState({ isSaveModalActive: true });
  };

  saveProgramAsCallback = async (programName: string, code: string): Promise<void> => {
    await this.props.managementService.saveProgram({
      name: programName,
      code: code,
      programId: ""
    });
    this.notificationService.push({
      type: "info",
      title: "Success",
      message: _T("Program has been saved in the library.")
    });
  };

  saveCurrentProgram = async () => {
    const attrs: IProgramToSaveAttributes = {
      code: this.props.executionService.code,
      name: this.props.executionService.programName,
      programId: this.props.executionService.programId
    };
    await this.props.managementService.saveProgram(attrs);
    this.notificationService.push({
      title: _T("Message"),
      message: _T("Program has been saved successfully."),
      type: "primary"
    });
  };

  exportScreenshot = async () => {
    const data = await this.props.executionService.getScreenshot(false);
    if (!data) {
      this.notificationService.push({
        title: _T("Message"),
        message: _T("Screenshot is not available because program has not been executed yet."),
        type: "primary"
      });
    }
    this.setState({ screenshotDataToSave: data });
  };
}
