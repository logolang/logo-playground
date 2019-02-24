import { connect } from "react-redux";
import { AppState } from "store/store";
import { SettingsPage } from "./settings-page";
import { envThunks } from "store/env/thunks.env";

export const SettingsPageContainer = connect(
  (state: AppState) => ({
    /** State to props */
    user: state.env.user,
    userSettings: state.env.userSettings
  }),
  {
    /** Actions to props */
    applyUserSettings: envThunks.applyUserSettings
  }
)(SettingsPage);
