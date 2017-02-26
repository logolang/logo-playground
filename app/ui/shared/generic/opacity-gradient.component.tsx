import * as React from 'react';
import * as cn from 'classnames';

import './opacity-gradient.component.scss'

let bodyBackColor: string | null = '';

interface IComponentProps {
    className: string
}

export class OpacityGradientComponent extends React.Component<IComponentProps, void> {
    constructor() {
        super();

        bodyBackColor = bodyBackColor || window.getComputedStyle(document.body).backgroundColor;
    }

    render(): JSX.Element {
        return (
            <div className={`opacity-gradient ${this.props.className}`} >
                <div className="cover-row r0" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r1" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r2" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r3" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r4" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r5" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r6" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r7" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r8" style={{ backgroundColor: bodyBackColor }} />
                <div className="cover-row r9" style={{ backgroundColor: bodyBackColor }} />
            </div>
        );
    }
}