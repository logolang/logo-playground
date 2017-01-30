import * as React from 'react';
import { Link } from 'react-router'

import { PageHeaderComponent } from './shared/generic/page-header.component';
import { Routes } from '../routes';

interface IComponentState {
}

interface IComponentProps {
}

export class StubComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <PageHeaderComponent title="Nothing here yet">
                    <Link to={Routes.appRoot} className="btn btn-info">
                        <span>Go to main page</span>
                    </Link>
                </PageHeaderComponent>
                <div className="row">
                    <div className="col-sm-12">
                    </div>
                </div>
            </div>
        );
    }
}