import * as React from 'react';
import * as jquery from 'jquery'

import { LogoExecutionService } from 'app/services/logo/logo-execution-service';
import { ServiceLocator } from 'app/services/service-locator';

import './output-panel.component.scss'

interface IComponentState {
}

interface IComponentProps {
}

export class OutputPanelComponent extends React.Component<IComponentProps, IComponentState> {
    playgroundEvents = ServiceLocator.resolve(x => x.playgroundEvents);
    lastWidth: number;
    lastHeight: number;
    logo: LogoExecutionService;

    resizeTimer: number;

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        this.resizeTimer = setInterval(() => {
            this.resizeCanvas();
        }, 500);

        this.logo = new LogoExecutionService();
        this.logo.initialize();
        this.playgroundEvents.setExecutor(this.logo);
    }

    componentWillUnmount() {
        this.logo.destroy();
        this.playgroundEvents.deactivate();
        clearInterval(this.resizeTimer);
    }

    resizeCanvas() {
        let container = jquery('.output-container');
        let height = container.height();
        let width = container.width();
        if (!height || !width || (height === this.lastHeight && width === this.lastWidth)) {
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