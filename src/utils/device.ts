export function checkIsMobileDevice() {
  if (window.matchMedia && window.matchMedia("only screen and (max-width: 760px)").matches) {
    return true;
  }
  return false;
}
