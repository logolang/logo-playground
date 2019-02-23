import { connect } from "react-redux";
import { AppState } from "store/store";
import { UserProfilePage } from "./user-profile";
import { envThunks } from "store/env/thunks.env";

export const UserProfileContainer = connect(
  (state: AppState) => ({
    /** State to props */
    user: state.env.user,
    userSettings: state.env.userSettings
  }),
  {
    /** Actions to props */
    applyUserSettings: envThunks.applyUserSettings
  }
)(UserProfilePage);
