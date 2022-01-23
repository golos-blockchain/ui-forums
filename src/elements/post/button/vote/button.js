import React from 'react';

import { Button, Popup, Icon } from 'semantic-ui-react';

export default class VoteButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            popupOpen: false,
            weight: 100,
        };
    }

    onPopupOpen = (event, data) => {
        this.setState({
            popupOpen: true,
        });
    };

    onPopupClose = (event, data) => {
        this.setState({
            popupOpen: false,
        });
    };

    onWeightChange = (event) => {
        let weight = event.target.value;
        if (weight === '0')
            weight = '10';
        this.setState({
            weight,
        });
    };

    onClick = (event, data) => {
        this.setState({
            popupOpen: false,
        }, () => {
            const { onClick } = this.props;
            if (onClick) onClick(event, data);
        });
    };

    render() {
        const { up, voted, loading } = this.props;

        let actualButton = (<Button
            onClick={this.onClick}
            weight={(up ? 1 : -1) * this.state.weight}
            disabled={loading}
            basic={!voted}
            icon={up ? 'thumbs up' : 'thumbs down'}
            color={up ? 'green' : 'red'}
            floated='left'
        />);

        if (voted)
            return actualButton;

        return (<Popup
            trigger={
                <Button
                    disabled={loading}
                    basic={!voted}
                    icon={up ? 'thumbs up' : 'thumbs down'}
                    color={up ? 'green' : 'red'}
                    floated='left'
                    style={{ opacity: this.state.popupOpen ? '0.25' : '1.0' }}
                />
            }
            on='click'
            position='bottom left'
            flowing
            open={this.state.popupOpen}
            onOpen={this.onPopupOpen}
            onClose={this.onPopupClose}
        >
            {actualButton}
            <span className='voting__range-result'>{(up ? '' : '-') + this.state.weight}%</span>
            <input type='range' className='voting__range'
                min={'0'} max={'100'} step='10'
                value={this.state.weight} onChange={this.onWeightChange} />
            <Icon name='close' size='large' color='grey' className='voting__close-button'
                onClick={this.onPopupClose} />
        </Popup>);
    }
}
