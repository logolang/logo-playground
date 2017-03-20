import * as React from 'react';
import * as cn from 'classnames'

interface IComponentProps {
    errorMessage: JSX.Element | string
}

export class ErrorMessageComponent extends React.Component<IComponentProps, void> {
    render(): JSX.Element | null {
        if (this.props.errorMessage) {
            return <div className="alert alert-danger">
                {this.props.errorMessage}
            </div>
        }
        return null;
    }
}