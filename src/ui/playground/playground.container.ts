import { connect } from "react-redux";
import { AppState } from "store/store";
import { playgroundActionCreator } from "store/playground/actions.playground";
import { Playground } from "./playground";
import { ProgramStorageType } from "services/program.model";
import { playgroundThunks } from "store/playground/thunks.playground";

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
    userSettings: state.env.userSettings,
    appTheme: state.env.appTheme
  }),
  {
    /** Actions to props */
    loadProgram: playgroundThunks.loadProgram,
    codeChanged: playgroundThunks.codeChanged,
    runProgram: playgroundActionCreator.runProgram,
    stopProgram: playgroundActionCreator.stopProgram,
    saveAsProgram: playgroundThunks.saveAsProgram,
    saveProgram: playgroundThunks.saveProgram,
    deleteProgram: playgroundThunks.deleteProgram,
    clearProgram: playgroundActionCreator.clearProgram,
    revertChanges: playgroundThunks.revertChanges,
    formatCode: playgroundThunks.formatCode
  }
)(Playground);
