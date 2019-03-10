import { createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import reduxThunk from "redux-thunk";

import { GalleryState, defaultGalleryState } from "./gallery/state.gallery";
import galleryReducers from "./gallery/reducers.gallery";
import { PlaygroundState, defaultPlaygroundState } from "./playground/state.playground";
import playgroundReducers from "./playground/reducers.playground";
import { TutorialsState, defaultTutorialsState } from "./tutorials/state.tutorials";
import tutorialsReducers from "./tutorials/reducers.tutorials";
import { EnvState, defaultEnvState } from "./env/state.env";
import envReducers from "./env/reducers.env";

export interface AppState {
  gallery: GalleryState;
  playground: PlaygroundState;
  tutorials: TutorialsState;
  env: EnvState;
}

export type GetState = () => AppState;

export function createInitialStore() {
  return createStore<AppState, any, {}, {}>(
    combineReducers({
      gallery: galleryReducers,
      playground: playgroundReducers,
      tutorials: tutorialsReducers,
      env: envReducers
    }),
    {},
    composeWithDevTools(applyMiddleware(reduxThunk))
  );
}

export function getDefaultState(): AppState {
  return {
    gallery: defaultGalleryState,
    playground: defaultPlaygroundState,
    tutorials: defaultTutorialsState,
    env: defaultEnvState
  };
}
