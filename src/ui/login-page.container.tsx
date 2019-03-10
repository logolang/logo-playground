import { connect } from "react-redux";

import { AppState } from "store/store";
import { envThunks } from "store/env/thunks.env";
import { LoginPage } from "./login-page";

export const LoginPageContainer = connect(
  (state: AppState) => ({
    user: state.env.user
  }),
  {
    onSignIn: envThunks.signIn
  }
)(LoginPage);
