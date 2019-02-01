export type NavigationHandler = (route: string) => void;

export class NavigationService {
  private static navHandler: NavigationHandler | undefined;

  public static setNavigationHandler(navHandler: NavigationHandler) {
    this.navHandler = navHandler;
  }

  public static navigate(route: string): void {
    this.navHandler && this.navHandler(route);
  }
}
