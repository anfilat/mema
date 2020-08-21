import React from "react";
import {Link, Typography} from "@material-ui/core";

export function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://scrapcount.anfilat.com/">
                Scrap Count
            </Link>
            {' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}
