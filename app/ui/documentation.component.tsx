import * as React from 'react';
import { Link } from 'react-router'

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';

import './documentation.component.scss'

const text = require('../resources/text/doc.html')

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
            <div className="container-fluid doc-section">
                <MainMenuComponent />
                <div dangerouslySetInnerHTML={{ __html: text as any }}></div>
            </div>
        );
    }
}