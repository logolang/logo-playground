import * as React from 'react';

import { ServiceLocator } from 'app/services/service-locator'

import './navbar-usercard.component.scss'

interface IUserCardComponentState {
}

interface IUserCardComponentProps {
    userName: string
    role: string
    caret: boolean
}

export class NavbarUsercardComponent extends React.Component<IUserCardComponentProps, IUserCardComponentState> {
    private loginService = ServiceLocator.resolve(x => x.loginService);

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
                            <div className="avatar">
                                {firstLetter}
                            </div>
                        </td>
                        <td className="userName"><span>{nameToDisplay}</span></td>
                        {
                            this.props.caret && <td rowSpan={2}>
                                <span className="caret">
                                </span>
                            </td>
                        }
                    </tr>
                    <tr>
                        <td className="userRole"><small>{this.props.role}</small></td>
                    </tr>
                </tbody>
            </table>
        );
    }
}