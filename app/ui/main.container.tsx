import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { Main } from "./main";
import { envActionCreator } from "app/store/env/actions.env";

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
