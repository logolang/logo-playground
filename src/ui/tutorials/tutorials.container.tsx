import { connect } from "react-redux";
import { AppState } from "store/store";
import { TutorialsPage } from "./tutorials";
import { tutorialsActionCreator } from "store/tutorials/actions.tutorials";
import { tutorialsThunks } from "store/tutorials/thunks.tutorials";

export const TutorialsContainer = connect(
  (state: AppState) => ({
    /** State to props */
    tutorialId: state.tutorials.tutorialId,
    stepId: state.tutorials.stepId,
    isLoading: state.tutorials.isLoading,
    code: state.tutorials.code,
    isRunning: state.tutorials.isRunning,
    isStepLoading: state.tutorials.isStepLoading,
    tutorials: state.tutorials.tutorials,
    currentTutorialInfo: state.tutorials.currentTutorialInfo,
    currentStepInfo: state.tutorials.currentStepInfo,
    currentStepContent: state.tutorials.currentStepContent,
    userSettings: state.env.userSettings,
    appTheme: state.env.appTheme
  }),
  {
    /** Actions to props */
    loadStep: tutorialsThunks.loadStep,
    codeChanged: tutorialsActionCreator.codeChanged,
    runProgram: tutorialsActionCreator.runProgram,
    stopProgram: tutorialsActionCreator.stopProgram,
    fixTheCode: tutorialsActionCreator.fixTheCode
  }
)(TutorialsPage);
