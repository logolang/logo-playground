import * as React from "react";
import { Observable, Subscription } from "rxjs";
import * as keymaster from "keymaster";

import { resolveInject } from "app/di";

import { $T } from "app/i18n/strings";
import { ensure } from "app/utils/syntax-helpers";
import { Routes } from "app/routes";
import { ProgramModel } from "app/services/program/program.model";
import { NotificationService } from "app/services/infrastructure/notification.service";
import { ProgramExecutionContext } from "app/services/program/program-execution.context";
import { ProgramManagementService, ProgramStorageType } from "app/services/program/program-management.service";
import { EventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";
import { PersonalGalleryService } from "app/services/gallery/personal-gallery.service";
import { NavigationService } from "app/services/infrastructure/navigation.service";

import { ShareScreenshotModalComponent } from "app/ui/code-panel/share-screenshot-modal.component";
import { ShareProgramModalComponent } from "app/ui/code-panel/share-program-modal.component";
import { CodeInputComponent } from "app/ui/_generic/code-input/code-input.component";
import { SaveProgramModalComponent } from "app/ui/code-panel/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/code-panel/program-controls-menu.component";
import { DeleteProgramModalComponent } from "./delete-program-modal.component";

import "./code-panel.component.less";

export interface ICodePanelComponentProps {
  programId?: string;
  storageType?: ProgramStorageType;
  programName: string;
  programCode: string;
  hasChanges: boolean;
  editorTheme: string;
  resizeEvents?: Observable<void>;
  onCodeChange(newCode: string): void;
  onSaveAs?(program: ProgramModel): void;
  onHasChangesChange?(hasChanges: boolean): void;
  executionContext: ProgramExecutionContext;
}

interface IComponentState {
  isSaveModalActive?: boolean;
  isSaveAsModalActive?: boolean;
  isShareModalActive?: boolean;
  isDeleteModalActive?: boolean;
  isTakeScreenshotModalActive?: boolean;
  screenshotDataToSave?: string;
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, IComponentState> {
  private notificationService = resolveInject(NotificationService);
  private navigationService = resolveInject(NavigationService);
  private managementService = resolveInject(ProgramManagementService);
  private galleryService = resolveInject(PersonalGalleryService);
  private eventsTracker = resolveInject(EventsTrackingService);
  private subscriptions: Subscription[] = [];
  private saveTempCodeTimer: any = undefined;

  constructor(props: ICodePanelComponentProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    keymaster("f8, f9", () => {
      this.runProgram();
      return false;
    });
    this.subscriptions.push(
      this.props.executionContext.onIsRunningChange.subscribe(() => {
        this.forceUpdate();
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
    keymaster.unbind("f8, f9");
  }

  private runProgram = () => {
    this.props.executionContext.executeProgram(this.props.programCode);
    this.eventsTracker.sendEvent(EventAction.programStart);
  };

  private stopProgram = () => {
    this.props.executionContext.stopProgram();
    this.eventsTracker.sendEvent(EventAction.programStop);
  };

  render(): JSX.Element {
    return (
      <div className="code-panel-container">
        {this.renderSaveModal()}
        {this.renderSaveAsModal()}
        {this.state.isTakeScreenshotModalActive && (
          <ShareScreenshotModalComponent
            imageBase64={this.state.screenshotDataToSave || ""}
            onClose={() => this.setState({ isTakeScreenshotModalActive: false })}
          />
        )}
        {this.state.isShareModalActive && (
          <ShareProgramModalComponent
            programName={this.props.programName}
            programCode={this.props.programCode}
            imageBase64={this.state.screenshotDataToSave || ""}
            onClose={() => this.setState({ isShareModalActive: false })}
          />
        )}
        {this.state.isDeleteModalActive && (
          <DeleteProgramModalComponent
            programName={this.props.programName}
            onClose={() => this.setState({ isDeleteModalActive: false })}
            onDelete={this.deleteProgram}
          />
        )}

        <ProgramControlsMenuComponent
          isRunning={this.props.executionContext.isRunning}
          onRunProgram={this.runProgram}
          onStopProgram={this.stopProgram}
          onExportImage={this.showExportScreenshotDialog}
          onSaveProgram={
            this.props.hasChanges && this.props.storageType === ProgramStorageType.gallery
              ? this.showSaveDialog
              : undefined
          }
          onSaveProgramAsNew={this.showSaveAsDialog}
          onDeleteProgram={
            this.props.storageType === ProgramStorageType.gallery ? this.showDeleteProgramDialog : undefined
          }
          onShareProgram={this.showShareProgramDialog}
          onRevertChanges={this.props.hasChanges && this.props.storageType ? this.revertChanges : undefined}
        />
        <CodeInputComponent
          className="code-input-container"
          editorTheme={this.props.editorTheme}
          code={this.props.programCode}
          onChanged={this.onCodeChanged}
          onHotkey={this.runProgram}
          resizeEvents={this.props.resizeEvents}
        />
      </div>
    );
  }

  private onCodeChanged = (newCode: string) => {
    this.props.onCodeChange(newCode);
    if (this.saveTempCodeTimer) {
      clearTimeout(this.saveTempCodeTimer);
    }
    this.saveTempCodeTimer = setTimeout(async () => {
      this.managementService.saveTempProgram(this.props.programId, newCode);
      if (!this.props.hasChanges) {
        this.props.onHasChangesChange && this.props.onHasChangesChange(true);
      }
    }, 500);
  };

  private renderSaveModal() {
    if (!this.state.isSaveModalActive) {
      return;
    }
    return (
      <SaveProgramModalComponent
        programName={this.props.programName}
        screenshot={this.state.screenshotDataToSave || ""}
        onClose={() => {
          this.setState({ isSaveModalActive: false });
        }}
        onSave={this.saveProgram}
        allowRename={false}
      />
    );
  }

  private renderSaveAsModal() {
    if (!this.state.isSaveAsModalActive) {
      return;
    }
    return (
      <SaveProgramModalComponent
        programName={this.props.programName}
        screenshot={this.state.screenshotDataToSave || ""}
        onClose={() => {
          this.setState({ isSaveAsModalActive: false });
        }}
        onSave={this.saveProgramAs}
        allowRename={true}
      />
    );
  }

  private showDeleteProgramDialog = () => {
    this.setState({ isDeleteModalActive: true });
  };

  private deleteProgram = async () => {
    await this.galleryService.remove(ensure(this.props.programId));
    this.eventsTracker.sendEvent(EventAction.deleteProgramFromPersonalLibrary);
    this.navigationService.navigate({ route: Routes.galleryRoot.build({}) });
  };

  showSaveDialog = async () => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    this.setState({
      isSaveModalActive: true,
      screenshotDataToSave: screenshot
    });
  };

  showSaveAsDialog = async () => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    this.setState({
      isSaveAsModalActive: true,
      screenshotDataToSave: screenshot
    });
  };

  private saveProgram = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    await this.managementService.saveProgramToLibrary({
      id: this.props.programId,
      newCode: this.props.programCode,
      newProgramName: newProgramName,
      newScreenshot: screenshot
    });

    this.notificationService.push({
      type: "success",
      title: $T.common.message,
      message: $T.gallery.programHasBeenSaved
    });

    this.props.onHasChangesChange && this.props.onHasChangesChange(false);
    this.eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);
  };

  private saveProgramAs = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    const newProgram = await this.managementService.saveProgramToLibrary({
      newCode: this.props.programCode,
      newProgramName: newProgramName,
      newScreenshot: screenshot
    });
    this.managementService.clearTempProgram(this.props.programId);
    this.notificationService.push({
      type: "success",
      title: $T.common.message,
      message: $T.gallery.programHasBeenSaved
    });
    this.eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);
    if (this.props.onSaveAs) {
      this.props.onSaveAs(newProgram);
    }
  };

  private revertChanges = async () => {
    const code = await this.managementService.revertLocalTempChanges(
      ensure(this.props.programId),
      ensure(this.props.storageType)
    );
    this.eventsTracker.sendEvent(EventAction.programResetChanges);
    this.props.onHasChangesChange && this.props.onHasChangesChange(false);
    this.props.onCodeChange(code);
  };

  private showExportScreenshotDialog = async () => {
    const screenshot = await this.props.executionContext.getScreenshot(false);
    if (!screenshot) {
      this.notificationService.push({
        type: "primary",
        title: $T.common.message,
        message: $T.program.screenShotNotAvailable
      });
    }
    this.setState({
      isTakeScreenshotModalActive: true,
      screenshotDataToSave: screenshot
    });
  };

  private showShareProgramDialog = async () => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    this.setState({
      isShareModalActive: true,
      screenshotDataToSave: screenshot
    });
  };
}
