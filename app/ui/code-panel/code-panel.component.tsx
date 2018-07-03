import * as React from "react";
import { ISubscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import * as keymaster from "keymaster";

import { resolveInject } from "app/di";

import { $T } from "app/i18n/strings";
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
  editorTheme: string;
  executionContext: ProgramExecutionContext;
  program: ProgramModel;
  saveCurrentEnabled: boolean;
  externalCodeChanges?: Observable<string>;
  resizeEvents?: Observable<void>;
  onHasChangesChange?: (hasChanges: boolean) => void;
  onSaveAs?: (program: ProgramModel) => void;
}

interface IComponentState {
  isSaveModalActive?: boolean;
  isSaveAsModalActive?: boolean;
  isShareModalActive?: boolean;
  isDeleteModalActive?: boolean;
  isTakeScreenshotModalActive?: boolean;
  hasLocalTempChanges: boolean;
  screenshotDataToSave?: string;
  code: string;
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, IComponentState> {
  private notificationService = resolveInject(NotificationService);
  private navigationService = resolveInject(NavigationService);
  private managementService = resolveInject(ProgramManagementService);
  private galleryService = resolveInject(PersonalGalleryService);
  private eventsTracker = resolveInject(EventsTrackingService);
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
      this.props.executionContext.onIsRunningChange.subscribe(() => {
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
    this.props.executionContext.executeProgram(this.state.code);
    this.eventsTracker.sendEvent(EventAction.programStart);
  };

  onStopProgram = () => {
    this.props.executionContext.stopProgram();
    this.eventsTracker.sendEvent(EventAction.programStop);
  };

  render(): JSX.Element {
    const execService = this.props.executionContext;
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
        {this.state.isDeleteModalActive && (
          <DeleteProgramModalComponent
            program={this.props.program}
            onClose={() => this.setState({ isDeleteModalActive: false })}
            onDelete={this.handleProgramDeleteConfirmation}
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
          onDeleteProgram={
            this.props.program.storageType === ProgramStorageType.gallery ? this.handleDeleteProgramClick : undefined
          }
          onShareProgram={this.shareProgram}
          revertChanges={
            this.state.hasLocalTempChanges && this.props.program.id ? this.revertCurrentProgram : undefined
          }
        />
        <CodeInputComponent
          className="code-input-container"
          editorTheme={this.props.editorTheme}
          code={this.state.code}
          onChanged={this.onCodeChanged}
          onHotkey={this.onRunProgram}
          containerResized={this.props.resizeEvents}
        />
      </div>
    );
  }

  onCodeChanged = (newCode: string) => {
    this.setState({ code: newCode });
    if (this.saveTempCodeTimer) {
      clearTimeout(this.saveTempCodeTimer);
    }
    this.saveTempCodeTimer = setTimeout(async () => {
      this.managementService.saveTempProgram(this.props.program.id, newCode);
      if (!this.state.hasLocalTempChanges) {
        this.setState({ hasLocalTempChanges: true });
        this.props.onHasChangesChange && this.props.onHasChangesChange(true);
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

  handleDeleteProgramClick = () => {
    this.setState({ isDeleteModalActive: true });
  };

  handleProgramDeleteConfirmation = async () => {
    await this.galleryService.remove(this.props.program.id);
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

  saveProgramCallback = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    await this.managementService.saveProgramToLibrary(
      newProgramName,
      screenshot,
      this.state.code,
      this.props.program,
      true
    );
    this.notificationService.push({
      type: "success",
      title: $T.common.message,
      message: $T.gallery.programHasBeenSaved
    });
    this.setState({ hasLocalTempChanges: false });
    this.props.onHasChangesChange && this.props.onHasChangesChange(false);
    this.eventsTracker.sendEvent(EventAction.saveProgramToPersonalLibrary);
  };

  saveProgramAsCallback = async (newProgramName: string): Promise<void> => {
    const screenshot = await this.props.executionContext.getScreenshot(true);
    const newProgram = await this.managementService.saveProgramToLibrary(
      newProgramName,
      screenshot,
      this.state.code,
      this.props.program,
      false
    );
    this.notificationService.push({
      type: "success",
      title: $T.common.message,
      message: $T.gallery.programHasBeenSaved
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
    this.props.onHasChangesChange && this.props.onHasChangesChange(false);
  };

  exportScreenshot = async () => {
    const data = await this.props.executionContext.getScreenshot(false);
    if (!data) {
      this.notificationService.push({
        type: "primary",
        title: $T.common.message,
        message: $T.program.screenShotNotAvailable
      });
    }
    this.setState({
      isTakeScreenshotModalActive: true,
      screenshotDataToSave: data
    });
  };

  shareProgram = async () => {
    const data = await this.props.executionContext.getScreenshot(true);
    this.setState({ isShareModalActive: true, screenshotDataToSave: data });
  };
}
