import { ErrorMessageComponent } from '../shared/generic/error-message.component';
import { ensure } from '../../utils/syntax-helpers';
import { handleError, subscribeLoadDataOnPropsParamsChange } from '../../utils/react-helpers';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';

//Expose react and react router in order for golden layout work
(window as any)['React'] = React;
(window as any)['ReactDOM'] = ReactDOM;
import * as goldenLayout from 'golden-layout';
import 'node_modules/golden-layout/src/css/goldenlayout-base.css';
import 'node_modules/golden-layout/src/css/goldenlayout-light-theme.css';

import { ServiceLocator } from 'app/services/service-locator'
import { LocalStorageService } from 'app/services/local-storage.service';
import { ProgramsSamplesRepository } from 'app/services/entities/programs-samples.repository';

import { CodePanelComponent } from './code-panel.component'
import { OutputPanelComponent } from './output-panel.component'

import './playground-page.component.scss';

interface IComponentState {
    isLoading: boolean
    code: string
    errorMessage: string
}

interface IComponentProps {
    params: {
        programId: string | undefined
        gistId: string | undefined
        sampleId: string | undefined
    }
}

export class PlaygroundPageComponent extends React.Component<IComponentProps, IComponentState> {
    layoutLocalStorage = new LocalStorageService<any>('logo-sandbox-layout', undefined);
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    currentCodeLocalStorage = new LocalStorageService<string>('logo-sandbox-codeplayground', 'cs\r\nfd 100');
    playgroundEvents = ServiceLocator.resolve(x => x.playgroundEvents);
    programsRepo = ServiceLocator.resolve(x => x.programsReporitory);
    programSamples = new ProgramsSamplesRepository();

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
                    width: 30,
                    isClosable: false,
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

        let code = this.currentCodeLocalStorage.getValue()

        this.state = this.buildDefaultState(this.props);
        subscribeLoadDataOnPropsParamsChange(this);
    }

    codeChanged = (code: string): void => {
        this.currentCodeLocalStorage.setValue(code);
        this.playgroundEvents.setCode(code);
    }

    buildDefaultState(props: IComponentProps): IComponentState {
        const state: IComponentState = {
            isLoading: true,
            code: '',
            errorMessage: ''
        };
        return state;
    }

    componentDidMount() {
        this.loadData(this.props)
    }

    async loadData(props: IComponentProps) {
        let code = '';
        if (this.props.params.programId) {
            const program = await handleError(this, () => this.programsRepo.get(ensure(props.params.programId)));
            if (program) {
                code = program.code;
            }
        } else if (this.props.params.sampleId) {
            const program = await handleError(this, () => this.programSamples.get(ensure(props.params.sampleId)));
            if (program) {
                code = program.code;
            }
        } else if (this.props.params.gistId) {
        } else {
            code = this.currentCodeLocalStorage.getValue();
        }

        let config = this.config;
        try {
            const storedState = this.layoutLocalStorage.getValue();
            console.log('state restored!', storedState);
            if (storedState) {
                config = storedState;
            }
        }
        catch (ex) { console.error('Error while getting stored layout state', ex) }

        const codePanelConfig = this.getContentWithType('code-panel', config.content);
        if (codePanelConfig) {
            (codePanelConfig as any).props = {
                code: code,
                codeChanged: this.codeChanged
            }
        } else {
            throw new Error('Cannot find code panel conponent in config');
        }

        const element = this.refs['container'] as any;
        if (this.layout) {
            this.layout.destroy();
        }
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

        this.setState({ isLoading: false, code: code });
        this.playgroundEvents.setCode(code);
    }

    componentWillUnmount() {
        this.layout.destroy();
        $(document.body).removeClass('full-page-body');
    }

    shouldComponentUpdate() {
        return false;
    }

    render(): JSX.Element {
        return (
            <div>
                <ErrorMessageComponent errorMessage={this.state.errorMessage} />
                <div className="full-page" ref='container'>
                </div>
            </div>
        );
    }

    private getContentWithType(type: string, content: goldenLayout.ItemConfigType[]): goldenLayout.ItemConfigType | undefined {
        if (content) {
            for (let item of content) {
                if (item.type === type || (item as any).component === type) {
                    return item;
                }
                if (item.content) {
                    let res = this.getContentWithType(type, item.content);
                    if (res) {
                        return res;
                    }
                }
            }
        }
        return undefined;
    }
}