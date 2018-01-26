import * as React from "react";

export interface IComponentProps<T> {
  readOnly?: boolean;
  allowNotSelected?: boolean;
  className?: string;
  idAttr?: string;
  items: T[];
  selectedItem?: T;
  selectionChanged: (selectedItem: T | undefined) => void;
  renderItem: (item: T) => JSX.Element | string;
  getItemIdentifier: (item: T) => string;
}

export class SimpleSelectComponent<T> extends React.Component<IComponentProps<T>, {}> {
  constructor(props: IComponentProps<T>) {
    super(props);
  }

  renderOptionItem(item: T) {
    return (
      <option key={this.props.getItemIdentifier(item)} value={this.props.getItemIdentifier(item)}>
        {this.props.renderItem(item)}
      </option>
    );
  }

  onSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.currentTarget.value;
    const item = this.props.items.find(e => selectedValue === this.props.getItemIdentifier(e));
    if (item !== undefined) {
      this.props.selectionChanged(item);
    } else {
      this.props.selectionChanged(undefined);
    }
  };

  render(): JSX.Element {
    const selectedVal = this.props.selectedItem ? this.props.getItemIdentifier(this.props.selectedItem) : "";

    return (
      <select
        disabled={this.props.readOnly}
        className={this.props.className}
        id={this.props.idAttr}
        value={selectedVal}
        onChange={this.props.readOnly ? undefined : this.onSelect}
      >
        {this.props.allowNotSelected && <option value="">··· Not Selected ···</option>}
        {this.props.items.map(item => this.renderOptionItem(item))}
      </select>
    );
  }
}
