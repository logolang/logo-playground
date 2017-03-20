import * as React from 'react';
import * as jquery from 'jquery'
import { Subscription, Subject, Observable } from 'rxjs'
import 'app/../lib/logojs/logo.js';
const polyfills = require('app/../lib/logojs/polyfills.logo.txt') as any;

import { LogoOutputGraphics } from './logo-output-graphics';
import { LogoOutputConsole } from './logo-output-console';
import { ThemeService } from "app/services/customizations/theme.service";
import { TurtleCustomizationsService } from "app/services/customizations/turtle-customizations.service";

import './logo-executor.component.scss'

interface IComponentState {
}

export interface ILogoExecutorComponentProps {
    height: number
    runCommands: Observable<string>
    stopCommands: Observable<void>
    makeScreenshotCommands?: Observable<{ small: boolean, result: (data: string) => void }>
    onError: (error: string) => void
    onIsRunningChanged: (isRunning: boolean) => void
}

export class LogoExecutorComponent extends React.Component<ILogoExecutorComponentProps, IComponentState> {
    runSubscription: Subscription;
    stopSubscription: Subscription;
    makeScreenshotSubscription: Subscription;
    theme = new ThemeService();
    private logo: any;
    private graphics: LogoOutputGraphics;
    private isRunning: boolean;

    constructor(props: ILogoExecutorComponentProps) {
        super(props);

        this.state = {
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        const turtleCustomizations = new TurtleCustomizationsService();
        this.graphics = new LogoOutputGraphics('#sandbox', '#turtle', '#overlay', turtleCustomizations.getCurrentTurtleImage(), turtleCustomizations.getCurrentTurtleSize());
        this.runSubscription = this.props.runCommands.subscribe(this.execute);
        this.stopSubscription = this.props.stopCommands.subscribe(this.abort);
        if (this.props.makeScreenshotCommands) {
            this.makeScreenshotSubscription = this.props.makeScreenshotCommands.subscribe(this.makeScreenShot);
        }
    }

    componentWillUnmount() {
        this.abort();
        if (this.runSubscription) {
            this.runSubscription.unsubscribe();
        }
        if (this.stopSubscription) {
            this.stopSubscription.unsubscribe();
        }
        if (this.makeScreenshotSubscription) {
            this.makeScreenshotSubscription.unsubscribe();
        }
    }

    render(): JSX.Element {
        return (
            <div className="logo-executor-container">
                <canvas id="sandbox" height={this.props.height}></canvas>
                <canvas id="turtle" height={this.props.height}></canvas>
                <div id="overlay"></div>
                <div id="errorMessagesContainer" className="alert alert-danger" role="alert" style={{ display: 'none' }}></div>
            </div>
        );
    }

    private showError = (error: string) => {
        jquery('#errorMessagesContainer').text(error);
        jquery('#errorMessagesContainer').show();
    }

    private clearError = () => {
        jquery('#errorMessagesContainer').text('');
        jquery('#errorMessagesContainer').hide();
    }

    private execute = async (code: string): Promise<void> => {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.props.onIsRunningChanged(this.isRunning);
        const lightThemeInit = `setbg 7 setpencolor 0 cs`;
        const darkThemeInit = `setbg 0 setpencolor 7 cs`;
        const initCode = this.theme.getCurrentTheme().isDark ? darkThemeInit : lightThemeInit;

        this.resizeCanvas();

        let LogoInterpreter: any = (window as any)['LogoInterpreter'];

        this.logo = new LogoInterpreter(
            this.graphics.initTurtle(),
            new LogoOutputConsole('#overlay'),
            function (name: any, def: any) { }
        );

        this.clearError();
        try {
            await this.logo.run(polyfills + '\r\n' + initCode + '\r\n' + code);
            this.isRunning = false;
            this.props.onIsRunningChanged(this.isRunning);
        }
        catch (ex) {
            console.error('error', ex);
            this.showError(ex.message);
            this.isRunning = false;
            this.props.onIsRunningChanged(this.isRunning);
        };
    }

    private abort = (): void => {
        if (this.logo) {
            this.logo.bye();
        }
    }

    private makeScreenShot = (params: { small: boolean, result: (data: string) => void }) => {
        if (this.graphics) {
            const data = this.graphics.createScreenshot(params.small);
            params.result(data);
        }
    }

    private resizeCanvas() {
        if (this.graphics) {
            let container = jquery('.logo-executor-container');
            let width = container.width();
            let height = container.height();
            this.graphics.resizeCanvas(width, height);
        }
    }
}