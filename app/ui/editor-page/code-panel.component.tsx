import * as React from 'react';

interface IComponentState {
}

interface IComponentProps {
}

export class CodePanelComponent extends React.Component<IComponentProps, IComponentState> {
    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    render(): JSX.Element {
        return (
            <div>
                Code Panel
            </div>
        );
    }
}