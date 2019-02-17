import {
  TutorialInfo,
  TutorialStepInfo,
  TutorialStepContent
} from "services/tutorials-content-service";

export interface TutorialsState {
  isLoading: boolean;
  isStepLoading: boolean;
  code: string;
  isRunning: boolean;
  tutorialId: string;
  stepId: string;
  tutorials?: TutorialInfo[];
  currentTutorialInfo?: TutorialInfo;
  currentStepInfo?: TutorialStepInfo;
  currentStepContent?: TutorialStepContent;
}

export const defaultTutorialsState: TutorialsState = {
  isLoading: true,
  isStepLoading: true,
  code: "",
  isRunning: false,
  tutorialId: "01-basics",
  stepId: "01-intro"
};
