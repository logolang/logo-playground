import { createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import thunk from "redux-thunk";

import { GalleryState, defaultGalleryState } from "./gallery/state.gallery";
import { reducers as galleryReducers } from "./gallery/reducers.gallery";
import { PlaygroundState } from "./playground/state.playground";
import { reducers as playgroundReducers } from "./playground/reducers.playground";
import { TutorialsState } from "./tutorials/state.tutorials";
import { reducers as tutorialsReducers } from "./tutorials/reducers.tutorials";
import { EnvState } from "./env/state.env";
import { reducers as envReducers } from "./env/reducers.env";

export interface AppState {
  gallery: GalleryState;
  playground: PlaygroundState;
  tutorials: TutorialsState;
  env: EnvState;
}

export type GetState = () => AppState;

export const store = createStore<AppState, any, {}, {}>(
  combineReducers({
    gallery: galleryReducers,
    playground: playgroundReducers,
    tutorials: tutorialsReducers,
    env: envReducers
  }),
  {},
  composeWithDevTools(applyMiddleware(thunk))
);
