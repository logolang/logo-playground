import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';

//Expose react and react router in order for golden layout work
(window as any)['React'] = React;
(window as any)['ReactDOM'] = ReactDOM;
import * as goldenLayout from 'golden-layout';

import { ensure } from 'app/utils/syntax-helpers';
import { handleError, subscribeLoadDataOnPropsParamsChange } from 'app/utils/react-helpers';

import { LocalStorageService } from 'app/services/local-storage.service';

import { CodePanelComponent } from './code-panel.component'
import { OutputPanelComponent } from './output-panel.component'

import './playground-page-layout.component.scss';

interface IComponentState {
}

interface IComponentProps {
    code: string
    programName: string
    onCodeChanged: (code: string) => void
}

export class PlaygroundPageLayoutComponent extends React.Component<IComponentProps, IComponentState> {
    layoutLocalStorage = new LocalStorageService<any>('logo-sandbox:golden-layout', undefined);

    private layout: goldenLayout;
    private config: goldenLayout.Config = {
        content: [{
            type: 'row',
            content: [
                {
                    title: 'Output',
                    type: 'react-component',
                    component: 'output-panel',
                    isClosable: false
                },
                {
                    title: 'Source Code',
                    type: 'react-component',
                    component: 'code-panel',
                    width: 40,
                    isClosable: false,
                }
            ]
        }]
    };

    constructor(props: IComponentProps) {
        super(props);
    }

    codeChanged = (code: string): void => {
        this.props.onCodeChanged(code);
    }

    componentDidMount() {
    }

    componentWillReceiveProps = (newProps: IComponentProps) => {
        if (newProps.code != this.props.code
            || newProps.programName != this.props.programName) {
            console.log('new props', newProps);
            this.initLayout(newProps);
        }
    }

    initLayout(props: IComponentProps) {
        try {
            const storedState = this.layoutLocalStorage.getValue();
            console.log('state restored!', storedState);
            if (storedState) {
                this.config = storedState;
            }
        }
        catch (ex) { console.error('Error while getting stored layout state', ex) }

        const codePanelConfig = this.findGoldenLayoutItem('code-panel', this.config.content);
        if (codePanelConfig) {
            codePanelConfig.title = props.programName;
            (codePanelConfig as any).props = {
                code: props.code,
                codeChanged: this.codeChanged
            }
        } else {
            throw new Error('Cannot find code panel conponent in config');
        }

        this.config.settings = {
            showMaximiseIcon: false,
            showPopoutIcon: false,
            showCloseIcon: false,
        };

        const element = this.refs['container'] as any;
        if (this.layout) {
            this.layout.destroy();
        }
        this.layout = new goldenLayout(this.config, element);
        this.layout.registerComponent('code-panel', CodePanelComponent);
        this.layout.registerComponent('output-panel', OutputPanelComponent);
        this.layout.init();
        const layoutUnsafe: any = this.layout;
        layoutUnsafe.on('stateChanged', () => {
            const state = this.layout.toConfig();
            this.layoutLocalStorage.setValue(state);
            //console.log('state saved!', state);
        });

        $(document.body).addClass('full-page-body');
    }

    componentWillUnmount() {
        if (this.layout) {
            this.layout.destroy();
        }
        $(document.body).removeClass('full-page-body');
    }

    shouldComponentUpdate() {
        return false;
    }

    render(): JSX.Element {
        return (
            <div className="full-page" ref='container'>
            </div>
        );
    }

    private findGoldenLayoutItem(type: string, content: goldenLayout.ItemConfigType[]): goldenLayout.ItemConfigType | undefined {
        if (content) {
            for (let item of content) {
                if (item.type === type || (item as any).component === type) {
                    return item;
                }
                if (item.content) {
                    let res = this.findGoldenLayoutItem(type, item.content);
                    if (res) {
                        return res;
                    }
                }
            }
        }
        return undefined;
    }
}