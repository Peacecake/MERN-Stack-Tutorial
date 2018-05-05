import axios from "axios";

import {GET_PROFILE, PROFILE_LOADING, GET_ERRORS, CLEAR_CURRENT_PROFILE} from "./types";

/**
 * Get current profile
 * @returns {Function}
 */
export const getCurrentProfile = () => dispatch => {
  dispatch(setProfileLoading());
  axios
    .get("/api/profiles")
    .then(res =>
      dispatch({
        type: GET_PROFILE,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_PROFILE,
        payload: {}
      })
    );
};

/**
 * Profile loading
 * @returns {{type: string}}
 */
export const setProfileLoading = () => {
  return {
    type: PROFILE_LOADING
  }
};

export const clearProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  }
};