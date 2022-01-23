import React from 'react';
import { connect } from 'react-redux';

import { notifyLogin } from '../../utils/notifications';

class NotifiAuthorizer extends React.Component {
	componentDidMount() {
		if (this.props.account && this.props.account.key) {
			console.log('Log in to notify...');
			try {
				notifyLogin(this.props.account.name, this.props.account.key);
			} catch (error) {
				console.error('NotifiAuthorizer', error);
			}
		}
	}

	render() {
		return null;
	}
}

function mapStateToProps(state, ownProps) {
    return {
        account: state.account,
    };
}

export default connect(mapStateToProps)(NotifiAuthorizer);
