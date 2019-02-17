import { connect } from "react-redux";
import { AppState } from "store/store";
import { SignInStatus } from "./sign-in-status";
import { envActionCreator } from "store/env/actions.env";

export const SignInStatusContainer = connect(
  (state: AppState) => ({
    userName: state.env.user.name,
    userImageUrl: state.env.user.imageUrl,
    userEmail: state.env.user.email,
    isLoggedIn: state.env.user.isLoggedIn,
    authProvider: state.env.user.authProvider
  }),
  {
    //selectSection: userActionCreator.loadSection
    onSignIn: envActionCreator.signIn
  }
)(SignInStatus);
