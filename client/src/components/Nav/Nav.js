import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {NavLoggedIn, NavNotLoggedIn} from "../Nav";
// import NavNotLoggedIn from "../NavNotLoggedIn";
import './Nav.css';
import AuthUserContext from '../AuthUserSession/AuthUserContext';
import { auth } from '../../firebase';
import Typwriter from '../Typwriter';

//Will need to update a logged in / logged out state
export class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  };

  logOutHandler = (event) => {
    event.preventDefault();
    auth.doSignOut();
  };

  render() {
    return (
      <nav className="navbar fixed-top navbar-expand-lg navbar-light">
      <span id="logoImage"><Link style={{ color: 'snow', textDecoration: 'none' }} to='/'>Listoka</Link></span>
        <button className="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#collapsingNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span> </span>
          <span> </span>
          <span> </span>
        </button>
        <Typwriter
          cursor={{
            show: true,
            blink: true,
            element: '|',
            hideWhenDone: true,
            hideWhenDoneDelay: 500,
          }}
        ></Typwriter>
        <div className="collapse navbar-collapse justify-content-end" id="collapsingNavbar">
          <AuthUserContext.Consumer>
            {
              authUser =>
                authUser
                  ? <NavLoggedIn logOutHandler={this.logOutHandler} />
                  : <NavNotLoggedIn 
                  openGistModal={this.props.openGistModal}
                  openJoinModal={this.props.openJoinModal}
                  openLoginModal={this.props.openLoginModal}
                  />
            }
          </AuthUserContext.Consumer>
        </div>
      </nav>
    )
  }
}