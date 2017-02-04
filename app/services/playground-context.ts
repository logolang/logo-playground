import { ICodeExecutor } from './code-executor';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Subscription } from 'rxjs'

export class PlaygroundContext {
    private isActiveSubj = new BehaviorSubject<boolean>(false);
    private isRunningSubj = new BehaviorSubject<boolean>(false);
    private code: string | undefined;
    private executor: ICodeExecutor | undefined;

    async run(): Promise<void> {
        if (this.executor) {
            this.isRunningSubj.next(true);
            await this.executor.execute(this.code || '');
            this.isRunningSubj.next(false);
        }
    }

    async stop(): Promise<void> {
        if (this.executor) {
            this.executor.abort();
        }
    }

    getCode(): string {
        return this.code || '';
    }

    setCode(code: string) {
        this.code = code;
        this.updateState();
    }

    getScreenshot(): string {
        return this.executor
            ? this.executor.createScreenshot()
            : '';
    }

    setExecutor(executor: ICodeExecutor) {
        this.executor = executor;
        this.updateState();
    }

    deactivate() {
        this.code = undefined;
        if (this.executor) {
            this.executor.abort();
        }
        this.executor = undefined;
        this.updateState();
    }

    updateState() {
        let ready = (!!this.executor) && (!!this.code);
        if (this.isActiveSubj.getValue() !== ready) {
            this.isActiveSubj.next(ready);
        }
    }

    subscribeToIsActive(delegate: (value: boolean) => void): Subscription {
        return this.isActiveSubj.subscribe(delegate);
    }

    subscribeToIsRunning(delegate: (value: boolean) => void): Subscription {
        return this.isRunningSubj.subscribe(delegate);
    }
}