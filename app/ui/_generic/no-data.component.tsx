import * as React from 'react';
import * as cn from 'classnames';

interface IComponentProps {
    title: JSX.Element | string
    description: JSX.Element | string
    iconClass?: string
}

export class NoDataComponent extends React.Component<IComponentProps, void> {
    render(): JSX.Element {
        const iconClass = this.props.iconClass || "glyphicon-list";

        return (
            <div className="row">
                <div className="col-sm-12">
                    <br />
                    <div className="ex-no-data-container">
                        <span className={`no-data-icon glyphicon ${iconClass}`} ></span>
                        <h2 className="no-data-title">{this.props.title}</h2>
                        <p className="no-data-description">{this.props.description}</p>
                    </div>
                </div>
            </div>
        );
    }
}