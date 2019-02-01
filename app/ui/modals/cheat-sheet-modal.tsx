import * as React from "react";
import * as markdown from "markdown-it";

import { resolve } from "app/di";
import { callActionSafe, ErrorDef } from "app/utils/error";
import { $T } from "app/i18n-strings";
import { LocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { EventAction, EventsTrackingService } from "app/services/env/events-tracking.service";

import { Loading } from "app/ui/_generic/loading";
import { Modal } from "app/ui/_generic/modal";

import "./cheat-sheet-modal.less";

interface State {
  isLoading: boolean;
  content: string[];
}

interface Props {
  onClose(): void;
  onError(err: ErrorDef): void;
}

export class CheatSheetModal extends React.Component<Props, State> {
  private contentLoader = resolve(LocalizedContentLoader);
  private eventsTracking = resolve(EventsTrackingService);

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      content: []
    };
  }

  async componentDidMount() {
    this.eventsTracking.sendEvent(EventAction.openCheatsheet);
    await this.loadData();
  }

  private async loadData() {
    const contentMd = await callActionSafe(this.props.onError, async () =>
      this.contentLoader.getFileContent("cheat-sheet.md")
    );
    if (contentMd) {
      const md = new markdown({
        html: true // Enable HTML tags in source;
      });

      const content = contentMd
        .split(/\n#\s/g)
        .map(p => p.trim())
        .filter(p => !!p)
        .map(p => md.render(p));

      this.setState({ content: content });
    }
    this.setState({ isLoading: false });
  }

  render(): JSX.Element {
    return (
      <Modal
        show
        title={$T.cheatSheet.cheatSheetTitle}
        onCancel={this.props.onClose}
        withoutFooter
        width="wide"
      >
        <Loading isLoading={this.state.isLoading} />
        <br />
        <div className="columns is-desktop">
          {this.state.content.map((content, index) => (
            <div className="column is-one-third-desktop" key={index}>
              <div className="doc-section content" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ))}
        </div>
        <br />
      </Modal>
    );
  }
}
