import * as React from "react";

interface IErrorComponentState {}

interface IErrorComponentProps {
  headerText: string;
  error: any;
}

export class GlobalErrorPage extends React.Component<IErrorComponentProps, IErrorComponentState> {
  state: IErrorComponentState = {};

  render(): JSX.Element {
    //TODO: get error message in more convenient way
    const errorMessage =
      this.props.error instanceof Error
        ? this.props.error.message
        : typeof this.props.error === "string" ? this.props.error : JSON.stringify(this.props.error);

    return (
      <div className="container">
        <br />
        <div className="alert alert-danger" role="alert">
          <strong>Error!</strong> {this.props.headerText}
        </div>
        <p>Error info:</p>
        <pre>{errorMessage}</pre>
      </div>
    );
  }
}
