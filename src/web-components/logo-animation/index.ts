const svg = require("!raw-loader!ui/../../content/images/square-logo-light.svg").default;

const animationFrames = [
  { id: "path4", fillColor: "#bf80ff", nextStepDelay: 200 },
  { id: "path6", fillColor: "#80ffff", nextStepDelay: 200 },
  { id: "path8", fillColor: "#ff8080", nextStepDelay: 200 },
  { id: "path10", fillColor: "#80ff80", nextStepDelay: 200 },
  { id: "path12", fillColor: "#c9c9c9", nextStepDelay: 200 },
  { id: "path4", fillColor: "#8000ff", nextStepDelay: 200 },
  { id: "path6", fillColor: "#00e6e6", nextStepDelay: 200 },
  { id: "path8", fillColor: "#ff0000", nextStepDelay: 200 },
  { id: "path10", fillColor: "#00ff00", nextStepDelay: 200 },
  { id: "path12", fillColor: "#999999", nextStepDelay: 200 },
  { id: "path4", fillColor: "#eeeeee", nextStepDelay: 0 },
  { id: "path6", fillColor: "#eeeeee", nextStepDelay: 0 },
  { id: "path8", fillColor: "#eeeeee", nextStepDelay: 0 },
  { id: "path10", fillColor: "#eeeeee", nextStepDelay: 0 },
  { id: "path12", fillColor: "#eeeeee", nextStepDelay: 200 }
];

class LogoLoading extends HTMLElement {
  private svgEl: SVGElement | null;
  private timerHandle: any;
  private currentFrame = 0;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "logo-wrapper");
    wrapper.innerHTML = svg;
    const svgEl = wrapper.querySelector("svg");
    if (svgEl) {
      svgEl.style.display = "block";
      svgEl.style.margin = "auto";
      this.svgEl = svgEl;
    }
    shadow.appendChild(wrapper);
  }

  connectedCallback() {
    this.timerHandle = setTimeout(() => this.animateFrame(), 200);
  }

  disconnectedCallback() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }

  animateFrame() {
    if (this.svgEl) {
      if (this.currentFrame >= animationFrames.length) {
        // make sure that animation is looped
        this.currentFrame = 0;
      }
      var frame = animationFrames[this.currentFrame];
      if (frame) {
        var animationElt = this.svgEl.querySelector("#" + frame.id);
        if (animationElt) {
          animationElt.setAttribute("style", "fill:" + frame.fillColor);
        }
        // timeout for next animation frame
        this.currentFrame++;
        setTimeout(() => this.animateFrame(), frame.nextStepDelay);
      }
    }
  }
}

customElements.define("logo-animation", LogoLoading);
