import { connect } from "react-redux";
import { AppState } from "store/store";
import { SignInStatus } from "./sign-in-status";
import { envThunks } from "store/env/thunks.env";

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
    onSignIn: envThunks.signIn
  }
)(SignInStatus);
