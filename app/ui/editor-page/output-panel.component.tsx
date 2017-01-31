import * as React from 'react';

interface IComponentState {
}

interface IComponentProps {
}

export class OutputPanelComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    render(): JSX.Element {
        return (
            <div>
                Output Panel
            </div>
        );
    }
}