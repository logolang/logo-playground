import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import * as cn from 'classnames';

interface IFileUploadComponentState {
    fileInfo?: File
    isLoading: boolean
}

interface IFileUploadComponentProps {
    onFileSelected?: (fileinfo: File) => void
    onFileContentReady?: (fileinfo: File, fileContent: ArrayBuffer) => void
}

export class FileUploadComponent extends React.Component<IFileUploadComponentProps, IFileUploadComponentState> {
    constructor(props: IFileUploadComponentProps) {
        super(props);

        this.state = {
            isLoading: false
        }
    }

    onFileSelected = (acceptedFiles: File[], rejectedFiles: any) => {
        console.log('Accepted files: ', acceptedFiles);
        console.log('Rejected files: ', rejectedFiles);

        if (acceptedFiles.length > 0) {
            const fileInfo = acceptedFiles[0];
            this.setState({ fileInfo: fileInfo });
            if (this.props.onFileSelected) {
                this.props.onFileSelected(fileInfo);
            }
            if (this.props.onFileContentReady) {
                this.setState({ isLoading: true });
                let reader = new FileReader();
                //reader.readAsText(fileInfo, "UTF-8");
                reader.readAsArrayBuffer(fileInfo);
                reader.onload = async (evt) => {
                    let fileBody = (evt.target as any).result as ArrayBuffer | undefined;
                    if (fileBody && this.props.onFileContentReady) {
                        this.props.onFileContentReady(fileInfo, fileBody);
                        fileBody = undefined;
                        this.setState({ isLoading: false });
                    }
                }
            }
        }
    }

    render(): JSX.Element {
        let dz = Dropzone as any as React.ComponentClass<any>;
        let refInstance: any;
        const props = {
            disableClick: true,
            multiple: false,
            onDrop: this.onFileSelected,
            className: 'ex-drap-drop-files-here',
            activeClassName: 'is-active',
            ref: (x: any) => { refInstance = x; }
        };
        return React.createElement(dz, props,
            <div>
                <span className="glyphicon glyphicon-arrow-down"></span>
                <div className="drag-drop-text">Drag file from your computer here or</div>
                <div>
                    <a href="javascript:void(0)" className={cn("btn btn-default", { "is-loading": this.state.isLoading })} onClick={() => { refInstance.open(); }}>Browse</a>
                </div>
            </div>);
    }
}