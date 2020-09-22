import React from "react";
import {Helmet} from "react-helmet";

export const Title = ({title}) => {
    return (
        <Helmet>
            <title>Scrap Count - {title}</title>
        </Helmet>
    );
};
