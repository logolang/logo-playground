import { connect } from "react-redux";
import { AppState } from "store/store";
import { playgroundActionCreator } from "store/playground/actions.playground";
import { Playground } from "./playground";
import { ProgramStorageType } from "services/program.model";

export const PlaygroundContainer = connect(
  (state: AppState, ownProps: { storageType?: ProgramStorageType; programId?: string }) => ({
    /** State to props */
    isLoading: state.playground.isLoading,
    storageType: ownProps.storageType,
    programId: ownProps.programId,
    code: state.playground.code,
    programName: state.playground.programName,
    hasModifications: state.playground.hasModifications,
    isRunning: state.playground.isRunning,
    userSettings: state.env.userSettings
  }),
  {
    /** Actions to props */
    loadProgram: playgroundActionCreator.loadProgram,
    codeChanged: playgroundActionCreator.codeChangedThunk,
    runProgram: playgroundActionCreator.runProgram,
    stopProgram: playgroundActionCreator.stopProgram,
    saveAsProgram: playgroundActionCreator.saveAsProgram,
    saveProgram: playgroundActionCreator.saveProgram,
    deleteProgram: playgroundActionCreator.deleteProgram,
    clearProgram: playgroundActionCreator.clearProgram,
    revertChanges: playgroundActionCreator.revertChanges
  }
)(Playground);
