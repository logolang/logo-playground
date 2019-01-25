import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { Main } from "./main";

export const MainContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoading: state.env.isLoading
  }),
  {
    /** Actions to props */
  }
)(Main);
