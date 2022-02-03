import React from 'react';
import { node, string } from 'prop-types';

import { LyspareIkon } from '@sb1/ffe-icons-react';

import BaseMessage from './BaseMessage';

const TipsMessage = props => (
    <BaseMessage type="tips" icon={<LyspareIkon />} {...props} />
);

TipsMessage.propTypes = {
    /** The content of the message box */
    children: node,
    /** Any extra class names to the wrapping DOM node */
    className: string,
    /**
     * Deprecated. Use `children` instead.
     * @deprecated
     */
    content: node,
    /** The icon to show. Has a default value, but can be overridden */
    icon: node,
    /** An optional title for the message */
    title: node,
};

export default TipsMessage;
