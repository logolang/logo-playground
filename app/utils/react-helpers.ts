import * as React from "react";

interface IParamsProps {
  match: { params: any };
}

interface IsLoadingState {
  isLoading: boolean;
}

interface ComponentWithDynamicDataLoad<S extends IsLoadingState, P extends IParamsProps> extends React.Component<P, S> {
  loadData: (props: P) => Promise<void>;
  buildDefaultState(props: P): S;
  props: P;
}

/**
 * Adds componentWillReceiveProps handler to component. If props params will be different it will execute loadData function.
 * This happens if URL in browser is changed and the same component receives new route, for instance history navigation event.
 */
export function subscribeLoadDataOnPropsParamsChange<S extends IsLoadingState, P extends IParamsProps>(
  component: ComponentWithDynamicDataLoad<S, P>
) {
  (component as any).componentWillReceiveProps = async (newProps: P) => {
    // console.log('componentWillReceiveProps params', component.props.params, newProps.params);
    if (JSON.stringify(component.props.match.params) != JSON.stringify(newProps.match.params)) {
      const newState = component.buildDefaultState(newProps);
      newState.isLoading = true;
      component.setState(newState);
      await component.loadData(newProps);
    }
  };
}
