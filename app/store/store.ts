import { createStore, combineReducers, AnyAction, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import thunk from "redux-thunk";

import { GalleryState, defaultGalleryState } from "./gallery/state.gallery";
import { reducers as galleryReducers } from "./gallery/reducers.gallery";
import { PlaygroundState, defaultPlaygroundState } from "./playground/state.playground";
import { reducers as playgroundReducers } from "./playground/reducers.playground";
import { TutorialsState, defaultTutorialsState } from "./tutorials/state.tutorials";
import { reducers as tutorialsReducers } from "./tutorials/reducers.tutorials";

export interface AppState {
  gallery: GalleryState;
  playground: PlaygroundState;
  tutorials: TutorialsState;
}

export type GetState = () => AppState;

export const defaultAppState: AppState = {
  gallery: defaultGalleryState,
  playground: defaultPlaygroundState,
  tutorials: defaultTutorialsState
};

export const store = createStore<AppState, AnyAction, {}, {}>(
  combineReducers({
    gallery: galleryReducers,
    playground: playgroundReducers,
    tutorials: tutorialsReducers
  }),
  defaultAppState,
  composeWithDevTools(applyMiddleware(thunk))
);
