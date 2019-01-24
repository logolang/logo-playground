import { createStore, combineReducers, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import thunk from "redux-thunk";

import { GalleryState, defaultGalleryState } from "./gallery/state.gallery";
import { reducers as galleryReducers } from "./gallery/reducers.gallery";
import { PlaygroundState, defaultPlaygroundState } from "./playground/state.playground";
import { reducers as playgroundReducers } from "./playground/reducers.playground";
import { TutorialsState, defaultTutorialsState } from "./tutorials/state.tutorials";
import { reducers as tutorialsReducers } from "./tutorials/reducers.tutorials";
import { UserState } from "./user/state.user";
import { reducers as userReducers } from "./user/reducers.user";

export interface AppState {
  gallery: GalleryState;
  playground: PlaygroundState;
  tutorials: TutorialsState;
  user: UserState;
}

export type GetState = () => AppState;

export const store = createStore<AppState, any, {}, {}>(
  combineReducers({
    gallery: galleryReducers,
    playground: playgroundReducers,
    tutorials: tutorialsReducers,
    user: userReducers
  }),
  {},
  composeWithDevTools(applyMiddleware(thunk))
);
