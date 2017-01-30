import * as React from 'react';

import './tabs-heading.component.scss'

interface IComponentProps {
    title: string
}

export class TabsHeadingComponent extends React.Component<IComponentProps, void> {
    constructor(props: IComponentProps) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <div className='tabs-heading'>
                <h3 className='heading'>{this.props.title}</h3>
                <div className="nav-stub nav"><li><a>&nbsp;</a></li></div>
            </div>
        );
    }
}