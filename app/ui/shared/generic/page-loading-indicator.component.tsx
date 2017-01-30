import * as React from 'react';
import * as cn from 'classnames'

interface IComponentProps {
    isLoading: boolean
    className?: string
}

export class PageLoadingIndicatorComponent extends React.Component<IComponentProps, void> {
    render(): JSX.Element | null {
        return <div className={this.props.className}>
            {this.props.isLoading && <div className="ex-page-loading-animation">
                <div className="ex-animated-dot"></div>
                <div className="ex-animated-dot"></div>
                <div className="ex-animated-dot"></div>
            </div>}
            <div className={cn("ex-page-content", { "is-visible": !this.props.isLoading })}>
                {this.props.children}
            </div>
        </div>
    }
}