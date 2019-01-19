import {
  ITutorialInfo,
  ITutorialStepInfo,
  ITutorialStepContent
} from "app/services/tutorials/tutorials-content-service";

export interface TutorialsState {
  isLoading: boolean;
  isStepLoading: boolean;
  code: string;
  isRunning: boolean;
  tutorialId: string;
  stepId: string;
  tutorials?: ITutorialInfo[];
  currentTutorialInfo?: ITutorialInfo;
  currentStepInfo?: ITutorialStepInfo;
  currentStepContent?: ITutorialStepContent;
}

export const defaultTutorialsState: TutorialsState = {
  isLoading: true,
  isStepLoading: true,
  code: "",
  isRunning: false,
  tutorialId: "01-basics",
  stepId: "01-intro"
};
