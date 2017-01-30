import * as React from 'react';

export class ProxyComponent extends React.Component<void, void> {
    render(): JSX.Element {
        return <div>
            {this.props.children}
        </div>
    }
}