import { Template, Plural } from "./i18n-tools";

export { Template, Plural };

export const $T = {
  common: {
    appTitle: "Logo playground",
    login: "Login",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    continue: "Continue",
    noImage: "No image",
    areYouSure: "Are you sure?",
    copied: "Copied",
    copyToClipboard: "Copy to clipboard",
    loading: "Loading...",
    message: "Message",
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
    saveToLibrary: "Save to personal library",
    takeScreenshot: "Take screenshot",
    screenshot: "Screenshot",
    screenShotNotAvailable: "Screenshot is not available because program has not been executed yet.",
    share: "Share",
    shareYourProgram: "Share your program",
    playgroundTitle: "Playground",
    programHasChanges: "This program has changes",
    youAreGoingToDeleteProgram: "You are going to delete this program.",
    imagePreview: "Image preview",
    imageUrl: "Image url",
    pleaseEnterNameForYourProgram: "Please enter the name for your program",
    defaultProgramWelcomeComment: "Welcome to LOGO playground!"
  },
  gallery: {
    galleryTitle: "Gallery",
    galleryImage: "Gallery image",
    noImage: "No image",
    personalLibrary: "Personal library",
    examplesGallery: "Examples gallery",
    editedDate: "Edited",
    notLoggedInText:
      "You are not authenticated. Your personal gallery is persisted in your browser local storage. Please sign in if you want to synchronize your gallery.",
    programHasBeenSaved: "Program has been saved in the personal library.",
    syncronizing: "Synchronizing gallery with remote storage",
    emptyLibrary: "You do not have any programs stored in personal library yet."
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
      tt10: "Chilly Bob",
      tt11: "Summer",
      tt12: "Bright Runner",
      tt13: "Deep Diver",
      tt2: "Chameleon",
      tt9: "Princess"
    },
    turtleSize: "Turtle size",
    turtleSizes: {
      extraSmall: "Extra small",
      small: "Small",
      medium: "Medium",
      large: "Large",
      huge: "Huge"
    },
    import: "Import",
    export: "Export",
    importCompletedTitle: "Import completed",
    addedProgramsMessage: new Plural("Added one program", "Added %d programs"),
    youHaveNProgramsInLibrary: new Plural(
      "You have one program in your library",
      "You have %d programs in your library"
    )
  },
  cheatSheet: {
    cheatSheetTitle: "Cheat sheet"
  }
};
