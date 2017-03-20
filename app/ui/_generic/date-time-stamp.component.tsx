import * as React from 'react';
import * as moment from 'moment'

interface IDateTimeStampComponentProps {
    datetime: Date
}

export class DateTimeStampComponent extends React.Component<IDateTimeStampComponentProps, void> {
    constructor(props: IDateTimeStampComponentProps) {
        super(props);
    }

    render(): JSX.Element {
        //const formatted = moment(this.props.datetime).fromNow();
        const formatted = moment(this.props.datetime).format('MMM D, YYYY h:mm a');
        return (
            <span>{formatted}</span>
        );
    }
}