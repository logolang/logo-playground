import * as React from "react";
import { ISubscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import * as keymaster from "keymaster";

import { resolveInject } from "app/di";

import { _T } from "app/services/customizations/localization.service";
import { ProgramModel } from "app/services/program/program.model";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { ProgramManagementService, ProgramStorageType } from "app/services/program/program-management.service";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

import { ShareScreenshotModalComponent } from "app/ui/playground/share-screenshot-modal.component";
import { ShareProgramModalComponent } from "app/ui/playground/share-program-modal.component";
import { CodeInputLogoComponent } from "app/ui/_shared/code-input-logo.component";
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";

import "./code-panel.component.less";

export interface ICodePanelComponentProps {
  editorTheme: string;
  executionService: ProgramExecutionContext;
  program: ProgramModel;
  saveCurrentEnabled: boolean;
  externalCodeChanges?: Observable<string>;
  containerResized?: Observable<void>;
  hasChangesStatus?: (hasChanges: boolean) => void;
  onSaveAs?: (program: ProgramModel) => void;
}

interface IComponentState {
  isSaveModalActive?: boolean;
  isSaveAsModalActive?: boolean;
  isShareModalActive?: boolean;
  isTakeScreenshotModalActive?: boolean;
  hasLocalTempChanges: boolean;
  screenshotDataToSave?: string;
  code: string;
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, IComponentState> {
  private notificationService = resolveInject(INotificationService);
  private navigationService = resolveInject(INavigationService);
  private managementService = resolveInject(ProgramManagementService);
  private eventsTracker = resolveInject(IEventsTrackingService);
  private subscriptions: ISubscription[] = [];
  private saveTempCodeTimer: any = undefined;

  constructor(props: ICodePanelComponentProps) {
    super(props);
    this.state = {
      hasLocalTempChanges: this.props.program.hasTempLocalModifications,
      code: this.props.program.code
    };
  }

  componentDidMount() {
    this.subscriptions.push(
      this.props.executionService.onIsRunningChanged.subscribe(() => {
        // Update state to force a component render.
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

  onRunProgram = () => {
    this.props.executionService.executeProgram(this.state.code);
    this.eventsTracker.sendEvent(EventAction.programStart);
  };

  onStopProgram = () => {
    this.props.executionService.stopProgram();
    this.eventsTracker.sendEvent(EventAction.programStop);
  };

  render(): JSX.Element {
    const execService = this.props.executionService;
    return (
      <div className="code-panel-container">
        {this.renderSaveModal()}
        {this.renderSaveAsModal()}
        {this.state.isTakeScreenshotModalActive && (
          <ShareScreenshotModalComponent
            imageBase64={this.state.screenshotDataToSave || ""}
            onClose={() => {
              this.setState({ isTakeScreenshotModalActive: false });
            }}
          />
        )}
        {this.state.isShareModalActive && (
          <ShareProgramModalComponent
            programModel={this.props.program}
            imageBase64={this.state.screenshotDataToSave || ""}
            onClose={() => {
              this.setState({ isShareModalActive: false });
            }}
          />
        )}

        <ProgramControlsMenuComponent
          isRunning={execService.isRunning}
          existingProgramName={this.props.program.name}
          runProgram={this.onRunProgram}
          stopProgram={this.onStopProgram}
          exportImage={this.exportScreenshot}
          save={
            this.props.program.storageType === ProgramStorageType.gallery &&
            this.state.hasLocalTempChanges &&
            this.props.program.id
              ? this.showSaveDialog
              : undefined
          }
          saveAsNew={this.showSaveAsDialog}
          onShareProgram={this.shareProgram}
          revertChanges={
            this.state.hasLocalTempChanges && this.props.program.id ? this.revertCurrentProgram : undefined
          }
        />
        <CodeInputLogoComponent
          className="code-input-container"
          editorTheme={this.props.editorTheme}
          code={this.state.code}
          onChanged={this.onCodeChanged}
          onHotkey={this.onRunProgram}
          containerResized={this.props.containerResized}
        />
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
        this.props.hasChangesStatus && this.props.hasChangesStatus(true);
      }
    }, 500);
  };

  renderSaveModal(): JSX.Element | null {
    if (this.state.isSaveModalActive) {
      return (
        <SaveProgramModalComponent
          programName={this.props.program.name}
          screenshot={this.state.screenshotDataToSave || ""}
          onClose={() => {
            this.setState({ isSaveModalActive: false });
          }}
          onSave={this.saveProgramCallback}
          allowRename={false}
        />
      );
    }
    return null;
  }

  renderSaveAsModal(): JSX.Element | null {
    if (this.state.isSaveAsModalActive) {
      return (
        <SaveProgramModalComponent
          programName={this.props.program.name}
          screenshot={this.state.screenshotDataToSave || ""}
          onClose={() => {
            this.setState({ isSaveAsModalActive: false });
          }}
          onSave={this.saveProgramAsCallback}
          allowRename={true}
        />
      );
    }
    return null;
  }

  showSaveDialog = async () => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    this.setState({ isSaveModalActive: true, screenshotDataToSave: screenshot });
  };

  showSaveAsDialog = async () => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    this.setState({ isSaveAsModalActive: true, screenshotDataToSave: screenshot });
  };

  saveProgramCallback = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    await this.managementService.saveProgramToLibrary(
      newProgramName,
      screenshot,
      this.state.code,
      this.props.program,
      true
    );
    this.notificationService.push({
      type: "success",
      title: _T("Message"),
      message: _T("Program has been saved in the personal library.")
    });
    this.setState({ hasLocalTempChanges: false });
    this.props.hasChangesStatus && this.props.hasChangesStatus(false);
    this.eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);
  };

  saveProgramAsCallback = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionService.getScreenshot(true);
    const newProgram = await this.managementService.saveProgramToLibrary(
      newProgramName,
      screenshot,
      this.state.code,
      this.props.program,
      false
    );
    this.notificationService.push({
      type: "success",
      title: _T("Message"),
      message: _T("Program has been saved in the personal library.")
    });
    this.setState({ hasLocalTempChanges: false });
    this.eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);
    if (this.props.onSaveAs) {
      this.props.onSaveAs(newProgram);
    }
  };

  revertCurrentProgram = async () => {
    const code = await this.managementService.revertLocalTempChanges(this.props.program);
    this.eventsTracker.sendEvent(EventAction.programResetChanges);
    this.setState({ hasLocalTempChanges: false, code: code });
    this.props.hasChangesStatus && this.props.hasChangesStatus(false);
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
