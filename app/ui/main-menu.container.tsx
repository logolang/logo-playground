import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { MainMenu } from "./main-menu";
import { userActionCreator } from "app/store/user/actions.user";

export const MainMenuContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoggedIn: state.user.isLoggedIn,
    userImageUrl: state.user.imageUrl
  }),
  {
    /** Actions to props */
    onLogout: userActionCreator.signOut
  }
)(MainMenu);
