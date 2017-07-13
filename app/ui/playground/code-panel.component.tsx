import * as React from "react";
import { Observable } from "rxjs";

import { lazyInject } from "app/di";
import { ProgramExecutionService } from "app/services/program/program-execution.service";
import {
  ProgramsLocalStorageRepository,
  IProgramsRepository
} from "app/services/gallery/personal-gallery-localstorage.repository";
import { ProgramManagementService, IProgramToSaveAttributes } from "app/services/program/program-management.service";

import "./code-panel.component.scss";

import { ShareScreenshotModalComponent } from "app/ui/playground/share-screenshot-modal.component";
import { CodeInputLogoComponent, ICodeInputComponentProps } from "app/ui/_shared/code-input-logo.component";
import { SaveProgramModalComponent } from "app/ui/playground/save-program-modal.component";
import { ProgramControlsMenuComponent } from "app/ui/playground/program-controls-menu.component";
import { ISubscription } from "rxjs/Subscription";

export interface ICodePanelComponentProps {
  editorTheme: string;
  executionService: ProgramExecutionService;
  managementService: ProgramManagementService;
}

interface IComponentState {
  isSaveModalActive: boolean;
  screenshotDataToSave?: string;
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, IComponentState> {
  @lazyInject(ProgramsLocalStorageRepository) private programsRepo: IProgramsRepository;
  private subscriptions: ISubscription[] = [];

  constructor(props: ICodePanelComponentProps) {
    super(props);
    this.state = {
      isSaveModalActive: false
    };
  }

  componentDidMount() {
    this.subscriptions.push(
      this.props.executionService.onIsRunningChanged.subscribe(() => {
        // Update state to force a component renderF
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
        {this.state.screenshotDataToSave &&
          <ShareScreenshotModalComponent
            imageBase64={this.state.screenshotDataToSave}
            onClose={() => {
              this.setState({ screenshotDataToSave: "" });
            }}
          />}

        <ProgramControlsMenuComponent
          isRunning={execService.isRunning}
          existingProgramName={execService.programName}
          runProgram={execService.runCurrentProgram}
          stopProgram={execService.stopCurrentProgram}
          exportImage={this.exportScreenshot}
          saveAsNew={this.showSaveDialog}
          saveCurrent={this.saveCurrentProgram}
        />
        {React.createElement(
          CodeInputLogoComponent,
          {
            className: "code-input-container",
            editorTheme: this.props.editorTheme,
            code: execService.code,
            focusCommands: execService.focusCommands,
            onChanged: this.onCodeChanged,
            onHotkey: execService.runCurrentProgram
          } as ICodeInputComponentProps
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
          programId={""}
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

  saveProgramAsCallback = async (attrs: IProgramToSaveAttributes): Promise<void> => {
    await this.props.managementService.saveProgram(attrs);
  };

  saveCurrentProgram = async () => {
    const attrs: IProgramToSaveAttributes = {
      code: this.props.executionService.code,
      name: this.props.executionService.programName,
      programId: this.props.executionService.programId
    };
    await this.props.managementService.saveProgram(attrs);
  };

  exportScreenshot = async () => {
    const data = await this.props.executionService.getScreenshot(false);
    this.setState({ screenshotDataToSave: data });
  };
}
