import * as React from 'react';
import { Link } from 'react-router'

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';


interface IComponentState {
}

interface IComponentProps {
}

export class DocumentationComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        };
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <MainMenuComponent />
                <PageHeaderComponent title="Documentation" />
                <div className="row">
                    <div className="col-sm-12">
                    </div>
                </div>
            </div>
        );
    }
}