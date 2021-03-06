import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { createProfile, getCurrentProfile } from "../../actions/profileActions";
import isEmpty from "../../validation/is-empty";

import TextFieldGroup from "../common/TextFieldGroup";
import TextAreaFieldGroup from "../common/TextAreaFieldGroup";
import InputGroup from "../common/InputGroup";
import SelectListGroup from "../common/SelectListGroup";

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displaySocialInputs: false,
      handle: "",
      company: "",
      website: "",
      location: "",
      status: "",
      skills: "",
      githubUsername: "",
      bio: "",
      twitter: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      instagram: "",
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.props.getCurrentProfile();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({ errors: nextProps.errors });
    }

    if (nextProps.profile.profile) {
      const profile = nextProps.profile.profile;

      // Bring skills array back to string
      const skillsCSV = profile.skills.join(",");

      // If profile field doesnt exist, make empty string
      profile.company = !isEmpty(profile.company) ? profile.company : "";
      profile.website = !isEmpty(profile.website) ? profile.website : "";
      profile.location = !isEmpty(profile.location) ? profile.location : "";
      profile.githubUsername = !isEmpty(profile.githubUsername) ? profile.githubUsername : "";
      profile.bio = !isEmpty(profile.bio) ? profile.bio : "";
      profile.social = !isEmpty(profile.social) ? profile.social : {};
      profile.twitter = !isEmpty(profile.social.twitter) ? profile.social.twitter : "";
      profile.facebook = !isEmpty(profile.social.facebook) ? profile.social.facebook : "";
      profile.linkedin = !isEmpty(profile.social.linkedin) ? profile.social.linkedin : "";
      profile.youtube = !isEmpty(profile.social.youtube) ? profile.social.youtube : "";
      profile.instagram = !isEmpty(profile.social.instagram) ? profile.social.instagram : "";

      // Set component field state
      this.setState({
        handle: profile.handle,
        company: profile.company,
        website: profile.website,
        location: profile.location,
        status: profile.status,
        skills: skillsCSV,
        githubUsername: profile.githubUsername,
        bio: profile.bio,
        twitter: profile.twitter,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        youtube: profile.youtube,
        instagram: profile.instagram
      });
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const profileData = {
      handle: this.state.handle,
      company: this.state.company,
      website: this.state.website,
      location: this.state.location,
      status: this.state.status,
      skills: this.state.skills,
      githubUsername: this.state.githubUsername,
      bio: this.state.bio,
      twitter: this.state.twitter,
      facebook: this.state.facebook,
      instagram: this.state.instagram,
      linkedin: this.state.linkedin,
      youtube: this.state.youtube
    };
    this.props.createProfile(profileData, this.props.history);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const { errors, displaySocialInputs } = this.state;

    let socialInputs;

    if (displaySocialInputs) {
      socialInputs = (
        <div>
          <InputGroup
            placeholder="Facebook Profile URL"
            name="facebook"
            value={this.state.facebook}
            onChange={this.onChange}
            icon="fab fa-facebook"
            error={errors.facebook}
          />
          <InputGroup
            placeholder="Twitter Profile URL"
            name="twitter"
            value={this.state.twitter}
            onChange={this.onChange}
            icon="fab fa-twitter"
            error={errors.twitter}
          />
          <InputGroup
            placeholder="Instagram Profile URL"
            name="instagram"
            value={this.state.instagram}
            onChange={this.onChange}
            icon="fab fa-instagram"
            error={errors.instagram}
          />
          <InputGroup
            placeholder="LinkedIn Profile URL"
            name="linkedin"
            value={this.state.linkedin}
            onChange={this.onChange}
            icon="fab fa-linkedin"
            error={errors.linkedin}
          />
          <InputGroup
            placeholder="Youtube Profile URL"
            name="youtube"
            value={this.state.youtube}
            onChange={this.onChange}
            icon="fab fa-youtube"
            error={errors.youtube}
          />
        </div>
      );
    }

    const options = [
      { label: "* Select Professional Status", value: 0 },
      { label: "Developer", value: "Developer" },
      { label: "Junior Developer", value: "Junior Developer" },
      { label: "Senior Developer", value: "Senior Developer" },
      { label: "Manager", value: "Manager" },
      { label: "Student or Learning", value: "Student or Learning" },
      { label: "Instructor or Teacher", value: "Instructor or Teacher" },
      { label: "Intern", value: "Intern" },
      { label: "Other", value: "Other" }
    ];

    return (
      <div className="create-profile">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <Link to="/dashboard" className="btn btn-light">
                Go back
              </Link>
              <h1 className="display-4 text-center">Edit Profile</h1>
              <small className="d-block pb-3">* = required fields</small>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  name="handle"
                  placeholder="* Profile Handle"
                  value={this.state.handle}
                  error={errors.handle}
                  info="A unique handle for your profile URL. You full name, company name, nickname, etc."
                  onChange={this.onChange}
                />
                <SelectListGroup
                  name="status"
                  placeholder="Status"
                  value={this.state.status}
                  onChange={this.onChange}
                  options={options}
                  error={errors.status}
                  info="Give us an idea of where you are at in your carrer"
                />
                <TextFieldGroup
                  name="company"
                  placeholder="Company"
                  value={this.state.company}
                  error={errors.company}
                  info="Could be your own company or one you work for"
                  onChange={this.onChange}
                />
                <TextFieldGroup
                  name="website"
                  placeholder="Website"
                  value={this.state.website}
                  error={errors.website}
                  info="Could be your own website or a company one"
                  onChange={this.onChange}
                />
                <TextFieldGroup
                  name="location"
                  placeholder="Location"
                  value={this.state.location}
                  error={errors.location}
                  info="City or city & state suggested (eg. Boston, MA)"
                  onChange={this.onChange}
                />
                <TextFieldGroup
                  name="skills"
                  placeholder="* Skills"
                  value={this.state.skills}
                  error={errors.skills}
                  info="Please use comma separated values (eg. HTML,CSS,Javascript,PHP)"
                  onChange={this.onChange}
                />
                <TextFieldGroup
                  name="githubUsername"
                  placeholder="Github Username"
                  value={this.state.githubUsername}
                  error={errors.githubUsername}
                  info="If you want your latest repos and a Github link, include your username"
                  onChange={this.onChange}
                />
                <TextAreaFieldGroup
                  name="bio"
                  placeholder="Short Bio"
                  value={this.state.bio}
                  error={errors.bio}
                  info="Tell us a little about yourself"
                  onChange={this.onChange}
                />

                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      this.setState(prevState => ({
                        displaySocialInputs: !prevState.displaySocialInputs
                      }));
                    }}
                  >
                    Add Social Network Links
                  </button>
                  <span className="text-muted">Optional</span>
                </div>
                {socialInputs}
                <input type="submit" value="Submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EditProfile.propTypes = {
  profile: PropTypes.object,
  error: PropTypes.object,
  getCurrentProfile: PropTypes.func.isRequired,
  createProfile: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile,
  errors: state.errors
});

export default connect(mapStateToProps, { createProfile, getCurrentProfile })(withRouter(EditProfile));
