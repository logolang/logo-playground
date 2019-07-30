(function() {
  var idIncrement = 0;

  function showLogoAnimation(parentElt) {
    if (!parentElt) {
      console.error("Can't show the logo animation because parent element is not found");
      return;
    }

    var svgTemplate = document.getElementById("logo-animation-svg-template");
    if (!svgTemplate) {
      console.error("Can't show the logo animation because svg template is not found");
      return;
    }

    var svgContainer = document.createElement("div");
    var svgId = "logo-animation-svg-" + ++idIncrement;
    svgContainer.setAttribute("id", svgId);
    svgContainer.setAttribute("style", "text-align:center;margin-top:100px;");
    svgContainer.innerHTML = svgTemplate.textContent;
    parentElt.appendChild(svgContainer);
    setTimeout(function() {
      animateFrame(svgId, 0);
    }, 200);
  }

  function animateFrame(svgId, currentFrameIndex) {
    var frames = [
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
    var animationContainer = document.getElementById(svgId);
    if (animationContainer) {
      // we have animation still visible, so animate required step
      if (currentFrameIndex >= frames.length) {
        // make sure that animation is looped
        currentFrameIndex = 0;
      }
      var frame = frames[currentFrameIndex];
      if (frame) {
        var svgElement = animationContainer.querySelector("#" + frame.id);
        if (svgElement) {
          svgElement.setAttribute("style", "fill:" + frame.fillColor);
        }
        // timeout for next animation frame
        setTimeout(function() {
          animateFrame(svgId, currentFrameIndex + 1);
        }, frame.nextStepDelay);
      }
    }
  }

  window.showLogoAnimation = showLogoAnimation;
})();
