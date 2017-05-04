import * as React from 'react';

import './navbar-usercard.component.scss'

interface IComponentProps {
    userName: string
    avatarImageUrl?: string
    caret: boolean
}

export class NavbarUsercardComponent extends React.Component<IComponentProps, void> {
    constructor(props: IComponentProps) {
        super(props);
    }

    render(): JSX.Element {
        const nameToDisplay = this.props.userName || "Guest";
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
                                this.props.avatarImageUrl
                                    ? <div className="avatar-img">
                                        <img className="img-responsive" src={this.props.avatarImageUrl} />
                                    </div>
                                    : <div className="avatar-img">
                                        <img className="img-responsive" src={require("../images/user-32-pic.png")} />
                                    </div>
                            }
                        </td>
                        <td className="userInfo">
                            <div className="userName">{nameToDisplay}</div>
                        </td>
                        {
                            this.props.caret
                            && <td rowSpan={2}>
                                <span className="caret">
                                </span>
                            </td>
                        }
                    </tr>
                </tbody>
            </table>
        );
    }
}