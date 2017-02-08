import * as React from 'react';

import './navbar-usercard.component.scss'

interface IUserCardComponentState {
}

interface IUserCardComponentProps {
    userName: string
    role: string
    caret: boolean
    loggedIn: boolean
}

export class NavbarUsercardComponent extends React.Component<IUserCardComponentProps, IUserCardComponentState> {
    constructor(props: IUserCardComponentProps) {
        super(props);

        this.state = {
        }
    }

    render(): JSX.Element {
        const nameToDisplay = this.props.userName || "Unknown";
        const firstLetter = nameToDisplay.substr(0, 1).toUpperCase();
        return (
            <table className="ex-navbar-usercard">
                <tbody>
                    <tr>
                        <td rowSpan={2}>
                            <ul className="nav navbar-nav">
                                <li>
                                    <a>
                                        &nbsp;
                                    </a>
                                </li>
                            </ul>
                        </td>
                        <td rowSpan={2}>
                            {
                                this.props.loggedIn
                                    ? <div className="avatar">
                                        <span>
                                            {firstLetter}
                                        </span>
                                    </div>
                                    : <div className="guest-pic">
                                    </div>
                            }
                        </td>
                        {
                            this.props.loggedIn &&
                            <td className="userName"><span>{nameToDisplay}</span></td>
                        }
                        {
                            this.props.caret && <td rowSpan={2}>
                                <span className="caret">
                                </span>
                            </td>
                        }
                    </tr>
                    {
                        this.props.loggedIn &&
                        <tr>
                            <td className="userRole"><small>{this.props.role}</small></td>
                        </tr>
                    }
                </tbody>
            </table>
        );
    }
}