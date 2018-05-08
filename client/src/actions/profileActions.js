import axios from "axios";

import { GET_PROFILE, PROFILE_LOADING, GET_ERRORS, CLEAR_CURRENT_PROFILE, SET_CURRENT_USER } from "./types";

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
 * Create Profile
 * @param profileData
 * @param history
 * @returns {Function}
 */
export const createProfile = (profileData, history) => dispatch => {
  axios
    .post("/api/profiles", profileData)
    .then(res => history.push("/dashboard"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
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
  };
};

export const clearProfile = () => {
  return {
    type: CLEAR_CURRENT_PROFILE
  };
};

/**
 * Delete account and profile
 */
export const deleteAccount = () => dispatch => {
  if (window.confirm("Are you sure? This can not be undone!")) {
    axios
      .delete("/api/profiles")
      .then(res =>
        dispatch({
          type: SET_CURRENT_USER,
          payload: {}
        })
      )
      .catch(err =>
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data
        })
      );
  }
};
