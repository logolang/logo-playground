import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { playgroundActionCreator } from "app/store/playground/actions.playground";
import { Playground } from "./playground";

export const PlaygroundContainer = connect(
  (state: AppState) => ({
    /** State to props */
    isLoading: state.playground.isLoading,
    // storageType: state.playground.storageType,
    // programId: state.playground.programId,
    code: state.playground.code,
    programName: state.playground.programName,
    hasModifications: state.playground.hasModifications,
    isRunning: state.playground.isRunning
  }),
  {
    /** Actions to props */
    loadProgram: playgroundActionCreator.loadProgram,
    codeChanged: playgroundActionCreator.codeChanged,
    runProgram: playgroundActionCreator.runProgram,
    stopProgram: playgroundActionCreator.stopProgram
  }
)(Playground);
