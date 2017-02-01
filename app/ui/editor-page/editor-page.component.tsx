import { LocalStorageService } from '../../services/local-storage.service';
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

import 'node_modules/golden-layout/src/css/goldenlayout-base.css';
import 'node_modules/golden-layout/src/css/goldenlayout-light-theme.css';
import './editor-page.component.scss';

interface IComponentState {
}

interface IComponentProps {
}

export class EditorPageComponent extends React.Component<IComponentProps, IComponentState> {
    layoutLocalStorage = new LocalStorageService<any>('logo-sandbox-layout', undefined);
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
        let config = this.config;
        try {
            const storedState = this.layoutLocalStorage.getValue();
            console.log('state restored!', storedState);
            if (storedState) {
                config = storedState;
            }
        }
        catch (ex) { console.error('Error while applying stored layout state', ex) }

        const element = this.refs['container'] as any;
        this.layout = new goldenLayout(config, element);
        this.layout.registerComponent('code-panel', CodePanelComponent);
        this.layout.registerComponent('output-panel', OutputPanelComponent);
        this.layout.init();
        const layoutUnsafe: any = this.layout;
        layoutUnsafe.on('stateChanged', () => {
            const state = this.layout.toConfig();
            this.layoutLocalStorage.setValue(state);
            console.log('state saved!', state);
        });

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