import * as React from "react";
import * as cn from "classnames";

interface IComponentState {
  fileInfo?: File;
  isLoading: boolean;
}

interface IComponentProps {
  buttonText: string;
  className?: string;
  onFileSelected?(fileinfo: File): void;
  onFileBinaryContentReady?(fileinfo: File, fileContent: ArrayBuffer): void;
  onFileTextContentReady?(fileinfo: File, fileContent: string): void;
}

export class FileSelectorComponent extends React.Component<IComponentProps, IComponentState> {
  private fileInputEl: HTMLInputElement | null;

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      isLoading: false
    };
  }

  onFileSelected = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const fileInfo = acceptedFiles[0];
      this.setState({ fileInfo: fileInfo });
      if (this.props.onFileSelected) {
        this.props.onFileSelected(fileInfo);
      }
      if (this.props.onFileBinaryContentReady) {
        this.setState({ isLoading: true });
        const reader = new FileReader();
        reader.readAsArrayBuffer(fileInfo);
        reader.onload = async evt => {
          const fileBody = (evt.target as any).result as ArrayBuffer | undefined;
          if (fileBody && this.props.onFileBinaryContentReady) {
            this.props.onFileBinaryContentReady(fileInfo, fileBody);
            this.setState({ isLoading: false });
          }
        };
      }
      if (this.props.onFileTextContentReady) {
        this.setState({ isLoading: true });
        const reader = new FileReader();
        reader.readAsText(fileInfo, "UTF-8");
        reader.onload = async evt => {
          const fileBody = (evt.target as any).result as string | undefined;
          if (fileBody && this.props.onFileTextContentReady) {
            this.props.onFileTextContentReady(fileInfo, fileBody);
            this.setState({ isLoading: false });
          }
        };
      }
    }
  };

  render(): JSX.Element {
    return (
      <button
        type="button"
        className={cn("button", this.props.className)}
        onClick={() => {
          this.fileInputEl && this.fileInputEl.click();
        }}
      >
        <span>{this.props.buttonText}</span>
        <input
          type="file"
          style={{ display: "none" }}
          ref={el => (this.fileInputEl = el)}
          onChange={this.onFileInputChange}
        />
      </button>
    );
  }

  onFileInputChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target) {
      const input = e.target as HTMLInputElement;
      if (input && input.files) {
        const files: File[] = [];
        for (let i = 0; i < input.files.length; ++i) {
          const file = input.files.item(i);
          if (file) {
            files.push(file);
          }
        }
        this.onFileSelected(files);
      }
    }
  };
}
