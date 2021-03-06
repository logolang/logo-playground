function $(selector: string) {
  const elt = document.querySelector(selector);
  if (!elt) {
    throw new Error("Cant find element in dom: " + selector);
  }
  return elt as HTMLElement;
}

export class LogoOutputConsole {
  constructor(private overlaySelector: string) {}

  read(s?: string) {
    return window.prompt(s || "");
  }

  write(...args: []) {
    const div = $(this.overlaySelector);
    for (const arg of args) {
      div.innerHTML += arg;
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
