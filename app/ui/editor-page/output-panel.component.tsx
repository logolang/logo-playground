import * as React from 'react';
import * as jquery from 'jquery'

import { LogoExecutionService } from '../../services/logo/logo-execution-service';
import { ServiceLocator } from '../../services/service-locator';

import './output-panel.component.scss'

interface IComponentState {
}

interface IComponentProps {
}

export class OutputPanelComponent extends React.Component<IComponentProps, IComponentState> {
    lastWidth: number;
    lastHeight: number;
    logo: LogoExecutionService;

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        setInterval(() => {
            this.resizeCanvas();
        }, 500);

        this.logo = new LogoExecutionService();
        this.logo.initialize();
        ServiceLocator.set(x => x.logo = this.logo);
    }

    componentWillUnmount() {
        this.logo.destroy();
        ServiceLocator.set(x => delete x.logo);
    }

    resizeCanvas() {
        let container = jquery('.output-container');
        let height = container.height();
        let width = container.width();
        if (height === this.lastHeight && width === this.lastWidth) {
            return;
        }
        this.lastWidth = width;
        this.lastHeight = height;
        let sandbox = jquery('#sandbox').eq(0)[0] as HTMLCanvasElement;
        let turtle = jquery('#turtle').eq(0)[0] as HTMLCanvasElement;
        sandbox.width = width;
        sandbox.height = height;
        turtle.width = width;
        turtle.height = height;
    }

    render(): JSX.Element {
        return (
            <div className="output-container">
                <canvas id="sandbox"></canvas>
                <canvas id="turtle"></canvas>
                <div id="overlay"></div>
            </div>
        );
    }
}