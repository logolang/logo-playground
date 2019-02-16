import * as React from "react";
import { debounce } from "app/utils/debounce";
import { checkIsMobileDevice } from "app/utils/device";
import "./tile-grid.less";

interface Props {
  tileWidth: number;
  tileWidthMobile: number;
  tiles: JSX.Element[];
}

interface State {
  tileWidth: number;
  gridWidth: number;
}

export class TileGrid extends React.Component<Props, State> {
  containerRef?: HTMLElement;

  constructor(props: Props) {
    super(props);
    this.state = { tileWidth: 0, gridWidth: 0 };
  }

  componentDidMount() {
    this.calculateColNumber();
    window.addEventListener("resize", this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
  }

  onWindowResize = debounce(() => {
    this.calculateColNumber();
  }, 100);

  calculateColNumber() {
    if (this.containerRef) {
      const isMobileDevice = checkIsMobileDevice();
      const width = this.containerRef.offsetWidth - 1;
      const colNumber = Math.max(
        1,
        Math.round(width / (isMobileDevice ? this.props.tileWidthMobile : this.props.tileWidth))
      );
      const tileWidth = width / colNumber;
      this.setState({ tileWidth: tileWidth, gridWidth: width });
    }
  }

  render() {
    return (
      <div className="tile-grid-component" ref={ref => (this.containerRef = ref || undefined)}>
        <div className="tile-grid" style={{ width: this.state.gridWidth }}>
          {this.state.tileWidth > 0 &&
            this.props.tiles.map((tile, index) => (
              <div key={index} style={{ width: this.state.tileWidth }} className="tile-grid-cell">
                {tile}
              </div>
            ))}
        </div>
      </div>
    );
  }
}
