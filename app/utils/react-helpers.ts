import * as React from 'react';
import { hashHistory } from 'react-router';

interface Component<S> {
    state: S;
    setState(state: S, callback?: () => any): void;
}

interface IParamsProps {
    params: any
}

interface IsLoadingState {
    isLoading: boolean
}

interface ComponentWithDynamicDataLoad<S extends IsLoadingState, P extends IParamsProps> extends Component<S> {
    loadData: (props: P) => Promise<void>
    props: P
}

export function translateInputChangeToState<S>(component: Component<S>, stateAction: (state: S, value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value;
        stateAction(component.state, val);
        component.setState(component.state);
    }
}

export function translateCheckBoxChangeToState<S>(component: Component<S>, stateAction: (state: S, value: boolean) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.checked;
        stateAction(component.state, val);
        component.setState(component.state);
    }
}

export function translateTextAreaChangeToState<S>(component: Component<S>, stateAction: (state: S, value: string[]) => void) {
    return (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = event.currentTarget.value;
        const lines = val.replace(/\r\n/g, '\r').replace(/\n/g, '\r').split('\r');
        stateAction(component.state, lines);
        component.setState(component.state);
    }
}

export function translateSelectChangeToState<S>(component: Component<S>, stateAction: (state: S, value: string) => void) {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
        const val = event.currentTarget.value;
        stateAction(component.state, val);
        component.setState(component.state);
    }
}

export function alterState<S>(component: Component<S>, action: (oldState: S, value?: any) => void) {
    return (value?: any) => {
        action(component.state, value);
        component.setState(component.state);
    }
}

export function goTo(route: string) {
    hashHistory.push(route);
}

export function goBack() {
    hashHistory.goBack();
}

export async function handleError<S extends { errorMessage: string }, P>(
    component: Component<S>,
    action: () => Promise<P>
): Promise<P | undefined> {
    try {
        component.state.errorMessage = '';
        const result = await action();
        return result;
    }
    catch (ex) {
        console.error(ex);
        component.state.errorMessage = ex.toString();
        return undefined;
    }
}

/**
 * Adds componentWillReceiveProps handler to component. If props params will be different it will execute loadData function.
 * This happens if URL in browser is changed and the same component receives new route, for instance history navigation event.
 */
export function subscribeLoadDataOnPropsParamsChange<S extends IsLoadingState, P extends IParamsProps>(component: ComponentWithDynamicDataLoad<S, P>) {
    (component as any).componentWillReceiveProps = (newProps: P) => {
        //console.log('componentWillReceiveProps params', component.props.params, newProps.params);
        if (JSON.stringify(component.props.params) != JSON.stringify(newProps.params)) {
            const state: IsLoadingState = { isLoading: true };
            component.setState(state as S);
            component.loadData(newProps);
        }
    }
}