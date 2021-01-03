import React from 'react';
import {Helmet} from 'react-helmet';

export default function Title({title}) {
    return (
        <Helmet>
            <title>MemA - {title}</title>
        </Helmet>
    );
};
