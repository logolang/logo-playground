import { connect } from "react-redux";
import { AppState } from "store/store";
import { Main } from "./main";
import { envActionCreator } from "store/env/actions.env";

export const MainContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoading: state.env.isLoading,
    tosterMessages: state.env.notifications
  }),
  {
    /** Actions to props */
    onTosterMessageClose: envActionCreator.closeNotification
  }
)(Main);
