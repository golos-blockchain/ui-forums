import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';

import { Search } from 'semantic-ui-react';

import * as searchActions from '../actions/searchActions';

const resultRenderer = ({ id, title, description }) => {
    return null;
};

resultRenderer.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
};

class SearchBox extends React.Component {
    componentWillMount() {
        this.resetComponent();
        this.search = debounce(this.props.actions.search, 400);
        this.state = {
            query: ''
        };
    }

    resetComponent = () => this.setState({ isLoading: false, results: [], value: '' });

    handleResultSelect = (e, result) => {
        this.setState({ redirect: result.description });
        this.resetComponent();
    };

    handleSearchChange = (e, value) => {
        this.setState({
            query: value.value
        });
    };

    goSearch = (e, value) => {
        if (e.keyCode != 13 || this.state.query === '') return;
        this.setState({
            redirect: '/search/' + this.state.query
        });
    };

    render() {
        const { isLoading, results } = this.props.search;
        if (this.state.redirect) {
            this.setState({ redirect: false });
            window.location.href = this.state.redirect;
            return null;
            //return (<Redirect to={this.state.redirect} />);
        }
        return (
            <Search
                style={{'float': 'right'}}
                fluid={true}
                loading={isLoading}
                open={false}
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                onKeyDown={this.goSearch}
                resultRenderer={resultRenderer}
                results={results}
                size='mini'
            />
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        search: state.search
    };
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(searchActions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox);
