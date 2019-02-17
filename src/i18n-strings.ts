import { Template, Plural } from "utils/i18n/i18n";

export { Template, Plural };

export const $T = {
  common: {
    appTitle: "Logo playground",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    continue: "Continue",
    areYouSure: "Are you sure?",
    copied: "Copied",
    copyToClipboard: "Copy to clipboard",
    signIn: "Sign in",
    signInWithGoogle: "Sign in with Google",
    signOut: "Sign out",
    error: "Sorry, error has occured"
  },
  program: {
    codePanelTitle: "Program box",
    outputPanelTitle: "Drawing box",
    program: "Program",
    programName: "Program name",
    publicUrl: "Public url",
    revertChanges: "Revert changes",
    run: "Run",
    runDescription: "Execute the program",
    stop: "Stop",
    stopDescription: "Stop execution of the program",
    save: "Save",
    saveAs: "Save as...",
    saveToLibraryModalTitle: "Save to personal library",
    takeScreenshot: "Take screenshot",
    screenshotModalTitle: "Screenshot",
    share: "Share",
    shareYourProgramModalTitle: "Share your program",
    playgroundTitle: "Playground",
    programHasChanges: "This program has changes",
    youAreGoingToDeleteProgram: "You are going to delete this program.",
    imagePreview: "Image preview",
    imageUrl: "Image url",
    pleaseEnterNameForYourProgram: "Please enter the name for your program"
  },
  gallery: {
    galleryTitle: "Gallery",
    galleryImage: "Gallery image",
    noImage: "No image",
    library: "Library",
    examples: "Examples",
    shapes: "Shapes",
    notLoggedInText:
      "You are not authenticated. Your personal gallery is persisted in your browser local storage. Please sign in if you want to synchronize your gallery.",
    emptyLibrary: "You do not have any programs stored in personal library yet.",
    import: "Import",
    export: "Export",
    importCompletedTitle: "Import completed",
    addedProgramsMessage: new Plural("Added one program", "Added %d programs"),
    wrongFileFormatForImport:
      "Looks like import file is corrupted or this format is not supported.",
    importModalTitle: "Import programs to library",
    chooseAFile: "Choose a file…"
  },
  tutorial: {
    tutorialsTitle: "Tutorials",
    tutorialPanelTitle: "Tutorial",
    chooseTutorial: "Choose a tutorial",
    chooseAnotherTutorial: "Choose another tutorial",
    stepIndicator: new Template("Step %1$s of %2$s", 2),
    start: "Start",
    back: "Back",
    helpItsNotworking: "Help – it's not working!",
    fixTheCodeMessage:
      "If your code isn't working as the tutorial describes, you can replace it with a working version.",
    fixTheCodeWarning: "This will overwrite your code entirely.",
    fixTheCodeTitle: "Fix the code?",
    yesFixMyCode: "Yes, fix my code",
    noLeaveItAsIs: "No, leave it as is"
  },
  about: {
    aboutTitle: "About"
  },
  settings: {
    settingsTitle: "Settings",
    userGuestNickName: "Guest",
    language: "Language",
    uiTheme: "User interface theme",
    turtleSkin: "Turtle outfit",
    turtleSkins: {
      bob: "Chilly Bob",
      summer: "Summer",
      bright_runner: "Bright Runner",
      diver: "Deep Diver",
      chameleon: "Chameleon",
      princess: "Princess"
    },
    turtleSize: "Turtle size",
    turtleSizes: {
      extraSmall: "Extra small",
      small: "Small",
      medium: "Medium",
      large: "Large",
      huge: "Huge"
    }
  },
  cheatSheet: {
    cheatSheetTitle: "Cheat sheet"
  }
};
