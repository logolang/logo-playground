import * as React from 'react';

interface IPageHeaderComponentState {
}

interface IPageHeaderComponentProps {
    title: JSX.Element | string
}

export class PageHeaderComponent extends React.Component<IPageHeaderComponentProps, IPageHeaderComponentState> {
    render(): JSX.Element {
        return (
            <div className="row">
                <div className="col-sm-12">
                    <br />
                    <div className="btn-toolbar pull-right">
                        {this.props.children}
                    </div>
                    <h1 className="ex-margin-top-zero">{this.props.title}</h1>
                    <br />
                </div>
            </div>
        );
    }
}