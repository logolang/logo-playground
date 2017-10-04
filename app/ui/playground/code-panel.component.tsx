import * as React from "react";
import { ISubscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import * as keymaster from "keymaster";

import { as } from "app/utils/syntax-helpers";
import { lazyInject } from "app/di";

import { _T } from "app/services/customizations/localization.service";
import { Routes } from "app/routes";
import { ProgramModel } from "app/services/program/program.model";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import {
  ProgramManagementService,
  IProgramToSaveAttributes,
  ProgramStorageType
} from "app/services/program/program-management.service";

import { ShareScreenshotModalComponent } from "app/ui/playground/share-screenshot-modal.component";
import { ShareProgramModalComponent } from "app/ui/playground/share-program-modal.component";
import { CodeInputLogoComponent, ICodeInputComponentProps } from "app/ui/_shared/code-input-logo.component";
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";

import "./code-panel.component.scss";

export interface ICodePanelComponentProps {
  editorTheme: string;
  executionService: ProgramExecutionContext;
  program: ProgramModel;
  saveCurrentEnabled: boolean;
  navigateAutomaticallyAfterSaveAs: boolean;
  externalCodeChanges?: Observable<string>;
  doNotShowLocalChangesIndicator?: boolean;
}

interface IComponentState {
  isSaveModalActive: boolean;
  isShareModalActive: boolean;
  isTakeScreenshotModalActive: boolean;
  hasLocalTempChanges: boolean;
  screenshotDataToSave: string;
  code: string;
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, IComponentState> {
  @lazyInject(INotificationService) private notificationService: INotificationService;
  @lazyInject(INavigationService) private navigationService: INavigationService;
  @lazyInject(ProgramManagementService) private managementService: ProgramManagementService;
  private subscriptions: ISubscription[] = [];
  private saveTempCodeTimer: any = undefined;

  constructor(props: ICodePanelComponentProps) {
    super(props);
    this.state = {
      isSaveModalActive: false,
      isShareModalActive: false,
      isTakeScreenshotModalActive: false,
      screenshotDataToSave: "",
      hasLocalTempChanges: this.props.program.hasTempLocalModifications,
      code: this.props.program.code
    };
  }

  componentDidMount() {
    this.subscriptions.push(
      this.props.executionService.onIsRunningChanged.subscribe(() => {
        // Update state to force a component render
        this.setState({});
      })
    );
    if (this.props.externalCodeChanges) {
      this.subscriptions.push(
        this.props.externalCodeChanges.subscribe(newCode => {
          this.onCodeChanged(newCode);
        })
      );
    }
    keymaster("f8, f9", () => {
      this.onRunProgram();
      return false;
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
    keymaster.unbind("f8, f9");
  }

  onRunProgram = (): void => {
    this.props.executionService.executeProgram(this.state.code);
  };

  render(): JSX.Element {
    const execService = this.props.executionService;
    return (
      <div className="code-panel-container">
        {this.renderSaveModal()}
        {this.state.isTakeScreenshotModalActive && (
          <ShareScreenshotModalComponent
            imageBase64={this.state.screenshotDataToSave}
            onClose={() => {
              this.setState({ isTakeScreenshotModalActive: false });
            }}
          />
        )}
        {this.state.isShareModalActive && (
          <ShareProgramModalComponent
            programModel={this.props.program}
            imageBase64={this.state.screenshotDataToSave}
            onClose={() => {
              this.setState({ isShareModalActive: false });
            }}
          />
        )}

        <ProgramControlsMenuComponent
          isRunning={execService.isRunning}
          existingProgramName={this.props.program.name}
          runProgram={this.onRunProgram}
          stopProgram={execService.stopProgram}
          exportImage={this.exportScreenshot}
          saveAsNew={this.showSaveDialog}
          onShareProgram={this.shareProgram}
          revertChanges={
            this.state.hasLocalTempChanges && this.props.program.id ? this.revertCurrentProgram : undefined
          }
        />
        <CodeInputLogoComponent
          className="code-input-container"
          editorTheme={this.props.editorTheme}
          code={this.state.code}
          focusCommands={execService.focusCommands}
          onChanged={this.onCodeChanged}
          onHotkey={this.onRunProgram}
        />
        {this.state.hasLocalTempChanges &&
          this.props.program.id &&
          !this.props.doNotShowLocalChangesIndicator && (
            <div className="alert-not-stored-container">
              <AlertMessageComponent message={_T("You have local changes in this program. ")} type="warning" />
            </div>
          )}
      </div>
    );
  }

  onCodeChanged = (newCode: string) => {
    this.setState({ code: newCode });
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

  saveProgramAsCallback = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    const newProgram = await this.managementService.saveProgramToLibrary(
      newProgramName,
      screenshot,
      this.state.code,
      this.props.program
    );
    this.notificationService.push({
      type: "info",
      title: "Success",
      message: _T("Program has been saved in the library.")
    });
    this.setState({ hasLocalTempChanges: false });
    if (this.props.navigateAutomaticallyAfterSaveAs) {
      this.navigationService.navigate({
        route: Routes.codeLibrary.build({
          id: newProgram.id
        })
      });
    }
  };

  revertCurrentProgram = async () => {
    const code = await this.managementService.revertLocalTempChanges(this.props.program);
    this.setState({ hasLocalTempChanges: false, code: code });
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
    this.setState({ isTakeScreenshotModalActive: true, screenshotDataToSave: data });
  };

  shareProgram = async () => {
    const data = await this.props.executionService.getScreenshot(true);
    this.setState({ isShareModalActive: true, screenshotDataToSave: data });
  };
}
