import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { MainMenu } from "./main-menu";
import { envActionCreator } from "app/store/env/actions.env";

export const MainMenuContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoggedIn: state.env.isLoggedIn,
    userImageUrl: state.env.imageUrl
  }),
  {
    /** Actions to props */
    onLogout: envActionCreator.signOut
  }
)(MainMenu);
