import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Image, Label } from 'semantic-ui-react';

import * as chainstateActions from '../../../actions/chainstateActions';

import AccountLink from './link';
import { proxifyImageUrl } from '../../../utils/ProxifyUrl';

class AccountAvatar extends React.Component {
  constructor(props) {
    super(props)
    const { username } = props;
    this.state = { username }
    this.loadAccountIfNotLoaded(props, username);
  }

  componentWillReceiveProps(nextProps) {
    const { username } = nextProps;
    if (username !== this.state.username) {
      this.setState({username});
      this.loadAccountIfNotLoaded(nextProps, username);
    }
  }

  loadAccountIfNotLoaded(props, username) {
    if (props.chainstate && props.chainstate.accounts) {
      if (!props.chainstate.accounts[username]) {
        props.actions.getAccounts([username]);
      }
    }
  }

  render() {
    const { username, noPopup, noLink } = this.props;
    let src = '/images/userpic.png';
    if (this.props.chainstate && this.props.chainstate.accounts) {
      const acc = this.props.chainstate.accounts[username];
      if (acc) {
        let meta = null;
        try {
          meta = JSON.parse(acc.json_metadata);
        } catch (ex) {
        }
        if (meta && meta.profile && meta.profile.profile_image) {
          src = meta.profile.profile_image;
          src = proxifyImageUrl(src);
        }
      }
    }
    const size = this.props.size || 35;
    const style = this.props.style || { minHeight: `${size}px`, minWidth: `${size}px` };
    const className = this.props.className || "ui rounded floated left mini image";
    const label = this.props.notifications ?
      <Label content={this.props.notifications}
        className='notifi-label'
        floating circular color='red' size='tiny' /> : undefined;
    const image = (
      <Image
        alt={username}
        label={label}
        bordered={false}
        className={className}
        src={src}
        style={style}
      />
    )
    if(noLink) return image
    return (
      <AccountLink
        username={username}
        noPopup={noPopup}
        content={image}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    chainstate: state.chainstate
  }
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators({
    ...chainstateActions
  }, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountAvatar);