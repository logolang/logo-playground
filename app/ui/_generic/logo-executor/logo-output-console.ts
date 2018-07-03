function $(s: any) {
  return document.querySelector(s);
}

export class LogoOutputConsole {
  constructor(private overlaySelector: string) {}

  read(s: any) {
    return window.prompt(s ? s : "");
  }

  write() {
    const div = $(this.overlaySelector);
    for (let i = 0; i < arguments.length; ) {
      i++;
      div.innerHTML += arguments[i];
    }
    div.scrollTop = div.scrollHeight;
  }

  clear() {
    const div = $(this.overlaySelector);
    div.innerHTML = "";
  }

  readback() {
    const div = $(this.overlaySelector);
    return div.innerHTML;
  }

  get textsize() {
    return parseFloat($(this.overlaySelector).style.fontSize.replace("px", ""));
  }

  set textsize(height) {
    $(this.overlaySelector).style.fontSize = Math.max(height, 1) + "px";
  }

  get font() {
    return $(this.overlaySelector).style.fontFamily;
  }

  set font(name) {
    if (["serif", "sans-serif", "cursive", "fantasy", "monospace"].indexOf(name) === -1) {
      name = JSON.stringify(name);
    }
    $(this.overlaySelector).style.fontFamily = name;
  }

  get color() {
    return $(this.overlaySelector).style.color;
  }

  set color(color) {
    $(this.overlaySelector).style.color = color;
  }
}
