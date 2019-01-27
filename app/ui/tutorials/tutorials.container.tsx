import { connect } from "react-redux";
import { AppState } from "app/store/store";
import { tutorialsActionCreator } from "app/store/tutorials/actions.tutorials";
import { TutorialsPage } from "./tutorials";

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
    userSettings: state.env.userSettings
  }),
  {
    /** Actions to props */
    loadStep: tutorialsActionCreator.loadStep,
    codeChanged: tutorialsActionCreator.codeChanged,
    runProgram: tutorialsActionCreator.runProgram,
    stopProgram: tutorialsActionCreator.stopProgram,
    fixTheCode: tutorialsActionCreator.fixTheCode
  }
)(TutorialsPage);
