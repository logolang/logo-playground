import * as React from "react";
import * as cn from "classnames";
import { Modal } from "react-bootstrap";
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { _T } from "app/services/customizations/localization.service";
import { IProgramToSaveAttributes } from "app/services/program/program-management.service";

interface IComponentState {
  errorMessage: string;
  programName: string;
  isSavingInProgress: boolean;
}

interface IComponentProps {
  code: string;
  programId: string;
  programName: string;
  onClose(): void;
  onSave(attributes: IProgramToSaveAttributes): Promise<void>;
}

export class SaveProgramModalComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      errorMessage: "",
      programName: this.props.programName,
      isSavingInProgress: false
    };
  }

  render(): JSX.Element {
    return (
      <Modal show={true} animation={false} onHide={this.props.onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>
            {_T("Save your program to Gallery")}{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-sm-12">
              <AlertMessageComponent message={this.state.errorMessage} />
              <form>
                <div className="form-group">
                  <label htmlFor="program-name-in-save-dialog">
                    {_T("Program name")}
                  </label>
                  <div className="row">
                    <div className="col-sm-12">
                      <input
                        type="text"
                        className="form-control"
                        id="program-name-in-save-dialog"
                        placeholder={_T("Please enter name for your program")}
                        autoFocus
                        value={this.state.programName}
                        onChange={event => {
                          this.setState({ programName: event.target.value });
                        }}
                        onKeyDown={async event => {
                          if (event.which == 13) {
                            event.preventDefault();
                            await this.saveProgramAction();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <br />
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className={cn("btn btn-primary", { "is-loading": this.state.isSavingInProgress })}
            onClick={this.saveProgramAction}
          >
            <span>
              {_T("Save")}
            </span>
          </button>
          <button type="button" className="btn btn-link" onClick={this.props.onClose}>
            <span>
              {_T("Cancel")}
            </span>
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  saveProgramAction = async () => {
    this.setState({ isSavingInProgress: true, errorMessage: "" });
    const attrs: IProgramToSaveAttributes = {
      name: this.state.programName,
      code: this.props.code,
      programId: this.props.programId
    };

    try {
      await this.props.onSave(attrs);
      this.props.onClose();
    } catch (ex) {
      const message = ex.toString();

      this.setState({
        isSavingInProgress: false,
        errorMessage: message
      });
    }
  };
}
