import * as React from 'react';
import { Link } from 'react-router'

interface IErrorComponentState {
}

interface IErrorComponentProps {
    headerText: string,
    error: any
}

export class ErrorComponent extends React.Component<IErrorComponentProps, IErrorComponentState> {
    state: IErrorComponentState = {
    };

    render(): JSX.Element {
        let errorMessage: string = "";
        if (this.props.error instanceof Error) {
            errorMessage = this.props.error.message;
        } else if (typeof this.props.error === "string") {
            errorMessage = this.props.error
        } else {
            errorMessage = JSON.stringify(this.props.error)
        }

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