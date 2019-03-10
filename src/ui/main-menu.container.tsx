import { connect } from "react-redux";
import { AppState } from "store/store";
import { MainMenu } from "./main-menu";
import { envActionCreator } from "store/env/actions.env";
import { envThunks } from "store/env/thunks.env";

export const MainMenuContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoggedIn: state.env.user.isLoggedIn,
    userImageUrl: state.env.user.imageUrl
  }),
  {
    /** Actions to props */
    onLogout: envThunks.signOut,
    onError: envActionCreator.handleError
  }
)(MainMenu);
