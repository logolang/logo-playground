import * as React from 'react';

interface IParamsProps {
    match: { params: any }
}

interface IsLoadingState {
    isLoading: boolean
}

interface ComponentWithDynamicDataLoad<S extends IsLoadingState, P extends IParamsProps> extends React.Component<P, S> {
    loadData: (props: P) => Promise<void>
    buildDefaultState(props: P): S
    props: P
}

export function translateInputChangeToState<P, S, K extends keyof S>(component: React.Component<P, S>, stateAction: (state: S, value: string) => Pick<S, K>) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value;
        const stateChange = stateAction(component.state, val);
        component.setState(stateChange);
    }
}

export function translateCheckBoxChangeToState<P, S, K extends keyof S>(component: React.Component<P, S>, stateAction: (state: S, value: boolean) => Pick<S, K>) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.checked;
        const stateChange = stateAction(component.state, val);
        component.setState(stateChange);
    }
}

export function translateTextAreaChangeToState<P, S, K extends keyof S>(component: React.Component<P, S>, stateAction: (state: S, value: string[]) => Pick<S, K>) {
    return (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = event.currentTarget.value;
        const lines = val.replace(/\r\n/g, '\r').replace(/\n/g, '\r').split('\r');
        const stateChange = stateAction(component.state, lines);
        component.setState(stateChange);
    }
}

export function translateSelectChangeToState<P, S, K extends keyof S>(component: React.Component<P, S>, stateAction: (state: S, value: string) => Pick<S, K>) {
    return (event: React.ChangeEvent<HTMLSelectElement>) => {
        const val = event.currentTarget.value;
        const stateChange = stateAction(component.state, val);
        component.setState(stateChange as any);
    }
}

export function alterState<P, S, K extends keyof S>(component: React.Component<P, S>, action: (oldState: S, value?: any) => Pick<S, K>) {
    return (value?: any) => {
        const stateChange = action(component.state, value);
        component.setState(stateChange);
    }
}

/**
 * Adds componentWillReceiveProps handler to component. If props params will be different it will execute loadData function.
 * This happens if URL in browser is changed and the same component receives new route, for instance history navigation event.
 */
export function subscribeLoadDataOnPropsParamsChange<S extends IsLoadingState, P extends IParamsProps>(component: ComponentWithDynamicDataLoad<S, P>) {
    (component as any).componentWillReceiveProps = (newProps: P) => {
        // console.log('componentWillReceiveProps params', component.props.params, newProps.params);
        if (JSON.stringify(component.props.match.params) != JSON.stringify(newProps.match.params)) {
            let newState = component.buildDefaultState(newProps);
            newState.isLoading = true;
            component.setState(newState);
            component.loadData(newProps);
        }
    }
}
