import * as React from "react";
import { ISubscription } from "rxjs/Subscription";

import { as } from "app/utils/syntax-helpers";
import { lazyInject } from "app/di";

import { _T } from "app/services/customizations/localization.service";
import { Routes } from "app/routes";
import { ProgramModel } from "app/services/program/program.model";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import {
  ProgramManagementService,
  IProgramToSaveAttributes,
  ProgramStorageType
} from "app/services/program/program-management.service";

import { ShareScreenshotModalComponent } from "app/ui/playground/share-screenshot-modal.component";
import {
  CodeInputLogoComponent,
  ICodeInputComponentProps
} from "app/ui/_shared/code-input-logo.component";
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";

import "./code-panel.component.scss";

export interface ICodePanelComponentProps {
  editorTheme: string;
  executionService: ProgramExecutionService;
  program: ProgramModel;
  saveCurrentEnabled: boolean;
  navigateAutomaticallyAfterSaveAs: boolean;
}

interface IComponentState {
  isSaveModalActive: boolean;
  hasLocalTempChanges: boolean;
  screenshotDataToSave: string;
}

export class CodePanelComponent extends React.Component<
  ICodePanelComponentProps,
  IComponentState
> {
  @lazyInject(INotificationService)
  private notificationService: INotificationService;
  @lazyInject(INavigationService) private navigationService: INavigationService;
  @lazyInject(ProgramManagementService)
  private managementService: ProgramManagementService;
  private subscriptions: ISubscription[] = [];
  private saveTempCodeTimer: any = undefined;

  constructor(props: ICodePanelComponentProps) {
    super(props);
    this.state = {
      isSaveModalActive: false,
      screenshotDataToSave: "",
      hasLocalTempChanges: this.props.program.hasTempLocalModifications
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
          existingProgramName={this.props.program.name}
          runProgram={execService.runCurrentProgram}
          stopProgram={execService.stopCurrentProgram}
          exportImage={this.exportScreenshot}
          saveAsNew={this.showSaveDialog}
          saveCurrent={
            this.props.saveCurrentEnabled ? this.saveCurrentProgram : undefined
          }
          revertChanges={
            this.state.hasLocalTempChanges && this.props.program.id ? (
              this.revertCurrentProgram
            ) : (
              undefined
            )
          }
        />
        <CodeInputLogoComponent
          className="code-input-container"
          editorTheme={this.props.editorTheme}
          code={execService.code}
          focusCommands={execService.focusCommands}
          onChanged={this.onCodeChanged}
          onHotkey={execService.runCurrentProgram}
        />
        {this.state.hasLocalTempChanges &&
        this.props.program.id && (
          <div className="alert-not-stored-container">
            <AlertMessageComponent
              message={_T("You have local changes in this program. ")}
              type="warning"
            />
          </div>
        )}
      </div>
    );
  }

  onCodeChanged = (newCode: string) => {
    this.props.executionService.updateCode(newCode, "internal");
    if (this.saveTempCodeTimer) {
      clearTimeout(this.saveTempCodeTimer);
    }
    this.saveTempCodeTimer = setTimeout(() => {
      this.managementService.saveTempProgram(this.props.program.id, newCode);
      if (!this.state.hasLocalTempChanges) {
        this.setState({ hasLocalTempChanges: true });
      }
    }, 500);
  };

  renderSaveModal(): JSX.Element | null {
    if (this.state.isSaveModalActive) {
      return (
        <SaveProgramModalComponent
          code={this.props.executionService.code}
          programName={this.props.program.name}
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

  saveProgramAsCallback = async (
    programName: string,
    code: string
  ): Promise<void> => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    const attrs: IProgramToSaveAttributes = {
      name: programName,
      code: code,
      programId: ""
    };
    const originalProgram = this.props.program;
    const programModel = new ProgramModel(
      originalProgram.id,
      originalProgram.storageType,
      programName,
      originalProgram.lang,
      code,
      screenshot
    );
    const newProgram = await this.managementService.saveProgramAs(
      code,
      screenshot,
      programModel
    );
    this.notificationService.push({
      type: "info",
      title: "Success",
      message: _T("Program has been saved in the library.")
    });
    this.setState({ hasLocalTempChanges: false });
    if (this.props.navigateAutomaticallyAfterSaveAs) {
      this.navigationService.navigate({
        route: Routes.playgroundCode.build({
          programId: newProgram.id,
          storageType: ProgramStorageType.gallery
        })
      });
    }
  };

  saveCurrentProgram = async () => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    await this.managementService.saveProgram(
      this.props.executionService.code,
      screenshot,
      this.props.program
    );
    this.notificationService.push({
      type: "primary",
      title: _T("Message"),
      message: _T("Program has been saved successfully.")
    });
    this.setState({ hasLocalTempChanges: false });
  };

  revertCurrentProgram = async () => {
    const code = await this.managementService.revertLocalTempChanges(
      this.props.program
    );
    this.props.executionService.updateCode(code, "external");
    this.setState({ hasLocalTempChanges: false });
  };

  exportScreenshot = async () => {
    const data = await this.props.executionService.getScreenshot(false);
    if (!data) {
      this.notificationService.push({
        title: _T("Message"),
        message: _T(
          "Screenshot is not available because program has not been executed yet."
        ),
        type: "primary"
      });
    }
    this.setState({ screenshotDataToSave: data });
  };
}
