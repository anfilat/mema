import React, {useEffect, useState} from 'react';
import {Container, CircularProgress} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useHttp} from '../hooks/http.hook';
import {Title} from '../components/Title';
import {Item} from '../components/Item';
import {useSnackbarEx} from "../hooks/snackbarEx.hook";
import {mdToHtml} from '../utils';

const useStyles = makeStyles(theme => ({
    main: {
        'margin-top': `${theme.spacing(1)}px`,
        'margin-bottom': `${theme.spacing(1)}px`,
        '& > *': {
            'margin-bottom': `${theme.spacing(1)}px`,
        }
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

export const ItemsPage = () => {
    const classes = useStyles();
    const {showError} = useSnackbarEx();
    const {loading, request} = useHttp();
    const [items, setItems] = useState([]);
    let content;

    useEffect(() => {
        let active = true;

        (async () => {
            const {ok, data, error} = await request('/api/search/list', {
                text: '',
            });

            if (active) {
                if (ok) {
                    setItems(data.list.map(({id, text, tags, time}) => ({
                        id,
                        html: mdToHtml(text),
                        tags,
                        time,
                    })));
                } else {
                    showError(error);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [request, showError]);

    if (loading) {
        content = <div className={classes.loader}>
            <CircularProgress size={60} />
        </div>;
    } else {
        content = <>
            {items.map(({id, html, tags}) => <Item
                text={html}
                tags={tags}
                key={id}
            />)}
        </>;
    }

    return (
        <>
            <Title title="Items"/>
            <Container component="main" maxWidth="md" className={classes.main}>
                {content}
            </Container>
        </>
    );
};
