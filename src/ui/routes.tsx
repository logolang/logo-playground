import { RouteInfo } from "utils/route-info";
import { ProgramStorageType } from "services/program.model";

export class Routes {
  static readonly loginPage = new RouteInfo("/login");
  static readonly infoPage = new RouteInfo("/info");
  static readonly settings = new RouteInfo("/settings");
  static readonly gallery = new RouteInfo("/gallery");
  static readonly playgroundDefault = new RouteInfo("/code");
  static readonly playground = new RouteInfo<{ storageType: ProgramStorageType; id: string }>(
    "/code/:storageType/:id"
  );
  static readonly tutorials = new RouteInfo("/tutorials");
}
