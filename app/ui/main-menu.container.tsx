import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { MainMenu } from "./main-menu";
import { envActionCreator } from "app/store/env/actions.env";

export const MainMenuContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoggedIn: state.env.user.isLoggedIn,
    userImageUrl: state.env.user.imageUrl
  }),
  {
    /** Actions to props */
    onLogout: envActionCreator.signOut,
    onError: envActionCreator.handleError
  }
)(MainMenu);
