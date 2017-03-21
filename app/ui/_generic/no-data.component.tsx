import * as React from 'react';
import * as cn from 'classnames';

import './no-data.component.scss';

interface IComponentProps {
    title: JSX.Element | string
    description: JSX.Element | string
    iconClass?: string
    noBorder?: boolean
}

export class NoDataComponent extends React.Component<IComponentProps, void> {
    render(): JSX.Element {
        const iconClass = this.props.iconClass || "glyphicon-list";

        return (
            <div className="row">
                <div className="col-sm-12">
                    <br />
                    <div className={cn("ex-no-data-container", { "no-border": this.props.noBorder })}>
                        <span className={`no-data-icon glyphicon ${iconClass}`} ></span>
                        <h2 className="no-data-title">{this.props.title}</h2>
                        <p className="no-data-description">{this.props.description}</p>
                    </div>
                </div>
            </div>
        );
    }
}