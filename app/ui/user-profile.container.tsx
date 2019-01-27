import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { envActionCreator } from "app/store/env/actions.env";
import { UserProfilePage } from "./user-profile";

export const UserProfileContainer = connect(
  (state: AppState) => ({
    /** State to props */
    user: state.env.user,
    userSettings: state.env.userSettings
  }),
  {
    /** Actions to props */
    applyUserSettings: envActionCreator.applyUserSettings
  }
)(UserProfilePage);
