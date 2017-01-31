import * as React from 'react';
import * as ReactDOM from 'react-dom';
//Expose react and react router in order for golden layout work
(window as any)['React'] = React;
(window as any)['ReactDOM'] = ReactDOM;
import * as goldenLayout from 'golden-layout';
import * as $ from 'jquery';

import { ServiceLocator } from 'app/services/service-locator'
import { CodePanelComponent } from './code-panel.component'
import { OutputPanelComponent } from './output-panel.component'

import 'node_modules/golden-layout/src/css/goldenlayout-base.css'
import 'node_modules/golden-layout/src/css/goldenlayout-light-theme.css'
import './editor-page.component.scss'

interface IComponentState {
}

interface IComponentProps {
}

export class EditorPageComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private layout: goldenLayout;
    readonly config: goldenLayout.Config = {
        settings: {
            showMaximiseIcon: false,
            showPopoutIcon: false,
            showCloseIcon: false,
        },
        content: [{
            type: 'row',
            content: [
                {
                    title: 'Source Code',
                    type: 'react-component',
                    component: 'code-panel',
                    props: { value: 'I\'m on the left' },
                    width: 30,
                    isClosable: false
                },
                {
                    title: 'Output',
                    type: 'react-component',
                    component: 'output-panel',
                    isClosable: false
                }
            ]
        }]
    };

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        };
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        const element = this.refs['container'] as any;
        this.layout = new goldenLayout(this.config, element);
        this.layout.registerComponent('code-panel', CodePanelComponent);
        this.layout.registerComponent('output-panel', OutputPanelComponent);
        this.layout.init();

        $(document.body).addClass('full-page-body');
    }

    componentWillUnmount() {
        this.layout.destroy();
        $(document.body).removeClass('full-page-body');
    }

    render(): JSX.Element {
        return (
            <div className="full-page" ref='container'>
            </div>
        );
    }
}