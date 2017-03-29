import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import { Observable } from 'rxjs';

//Expose react and react router in order for golden layout work
(window as any)['React'] = React;
(window as any)['ReactDOM'] = ReactDOM;
import * as goldenLayout from 'golden-layout';

import { CodePanelComponent, ICodePanelComponentProps } from './code-panel.component'
import { OutputPanelComponent, IOutputPanelComponentProps } from './output-panel.component'

import { ServiceLocator } from "app/services/service-locator";

import './playground-page-layout.component.scss';

interface IComponentState {
}

interface IComponentProps {
    programName: string
    codePanelProps: ICodePanelComponentProps
    outputPanelProps: IOutputPanelComponentProps
}

export class PlaygroundPageLayoutComponent extends React.Component<IComponentProps, IComponentState> {
    private userDataService = ServiceLocator.resolve(x => x.userDataService);

    private layout: goldenLayout;
    private readonly defaultConfig: goldenLayout.Config = {
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
    private config: goldenLayout.Config = this.defaultConfig;

    constructor(props: IComponentProps) {
        super(props);
    }

    componentDidMount() {
        this.initLayout(this.props);
    }

    componentWillReceiveProps = (newProps: IComponentProps) => {
        if (newProps.programName != this.props.programName) {
            console.log('new props', newProps);
            this.initLayout(newProps);
        }
    }

    async initLayout(props: IComponentProps) {
        try {
            const storedState = await this.userDataService.getPlaygroundLayoutJSON();
            if (storedState) {
                this.config = JSON.parse(storedState);
            }
        }
        catch (ex) { console.error('Error while getting stored layout state', ex) }

        // Set props for components in Golden-Layout
        const codePanelConfig = this.getGoldenLayoutConfigItem('code-panel', this.config);
        codePanelConfig.title = props.programName;
        (codePanelConfig as any).props = this.props.codePanelProps;

        const outputPanelConfig = this.getGoldenLayoutConfigItem('output-panel', this.config);
        (outputPanelConfig as any).props = this.props.outputPanelProps;

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
        layoutUnsafe.on('stateChanged', this.saveState);

        $(document.body).addClass('full-page-body');
    }

    saveState = () => {
        const config = this.layout.toConfig();
        const codePanelConfig = this.getGoldenLayoutConfigItem('code-panel', config);
        (codePanelConfig as any).props = {};

        const outputPanelConfig = this.getGoldenLayoutConfigItem('output-panel', config);
        (outputPanelConfig as any).props = {};

        this.userDataService.setPlaygroundLayoutJSON(JSON.stringify(config));
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

    private getGoldenLayoutConfigItem(type: string, config: goldenLayout.Config): goldenLayout.ItemConfigType {
        let item = this.findGoldenLayoutItem(type, config.content);
        if (item) {
            return item;
        } else {
            throw new Error(`Cannot find element ${type} in golden layout config`);
        }
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