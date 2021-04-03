import React from 'react';

import './ToolbarButton.css';

export default class ToolbarButton extends React.Component {
    render() {
        const { icon, className, onClick } = this.props;
        return (
            <span className={'msgs-toolbar-button ' + (className || '')} onClick={onClick || undefined}>
                <ion-icon name={icon}></ion-icon>
            </span>
        );
    }
}
