import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { Main } from "./main";

export const MainContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoading: state.user.isLoading
  }),
  {
    /** Actions to props */
  }
)(Main);
