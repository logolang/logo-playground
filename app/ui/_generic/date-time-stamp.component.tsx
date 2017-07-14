import * as React from "react";
import * as moment from "moment";

const yesterdayDate = moment().subtract(1, "d");

interface IDateTimeStampComponentProps {
  datetime: Date;
}

export class DateTimeStampComponent extends React.Component<IDateTimeStampComponentProps, void> {
  constructor(props: IDateTimeStampComponentProps) {
    super(props);
  }

  private formatDate(date: Date) {
    const momDate = moment(date);
    const formattedDate = momDate.isAfter(yesterdayDate) ? momDate.fromNow() : momDate.calendar();
    return formattedDate;
  }

  render(): JSX.Element {
    const formatted = this.formatDate(this.props.datetime);
    return (
      <span>
        {formatted}
      </span>
    );
  }
}
