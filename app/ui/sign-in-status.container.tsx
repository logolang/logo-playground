import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { SignInStatus } from "./sign-in-status";
import { envActionCreator } from "app/store/env/actions.env";

export const SignInStatusContainer = connect(
  (state: AppState) => ({
    userName: state.env.name,
    userImageUrl: state.env.imageUrl,
    userEmail: state.env.email,
    isLoggedIn: state.env.isLoggedIn,
    authProvider: state.env.authProvider
  }),
  {
    //selectSection: userActionCreator.loadSection
    onSignIn: envActionCreator.signIn
  }
)(SignInStatus);
