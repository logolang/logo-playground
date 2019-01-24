import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { SignInStatus } from "./sign-in-status";
import { userActionCreator } from "app/store/user/actions.user";

export const SignInStatusContainer = connect(
  (state: AppState) => ({
    userName: state.user.name,
    userImageUrl: state.user.imageUrl,
    userEmail: state.user.email,
    isLoggedIn: state.user.isLoggedIn,
    authProvider: state.user.authProvider
  }),
  {
    //selectSection: userActionCreator.loadSection
    onSignIn: userActionCreator.signIn
  }
)(SignInStatus);
