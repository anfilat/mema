import React, {useEffect, useState} from 'react';
import {useLocation} from "react-router-dom";
import {Container, CircularProgress} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Virtuoso} from 'react-virtuoso'
import {useHttp} from '../hooks/http.hook';
import {useMounted} from '../hooks/mounted.hook';
import {getSearch, setSearch} from '../services/search';
import {Title} from '../components/Title';
import {Item} from '../components/Item';
import {useSnackbarEx} from "../hooks/snackbarEx.hook";
import {mdToHtml} from '../utils';

const useStyles = makeStyles(theme => ({
    main: {
        height: `calc(100vh - 64px)`,
    },
    listFooter: {
        padding: `${theme.spacing(1)}px`,
        textAlign: 'center',
    },
}));

const itemsLimit = 25;

export const ItemsPage = () => {
    const classes = useStyles();
    const {showError} = useSnackbarEx();
    const {request} = useHttp();
    const mounted = useMounted();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loadMore, setLoadMore] = useState(true);
    const [allDataHere, setAllDataHere] = useState(false);
    const urlSearch = new URLSearchParams(useLocation().search).get('search') ?? '';
    const search = getSearch();
    const title = search ? `Items: ${search}` : 'Items';

    if (search !== urlSearch) {
        setSearch(urlSearch);

        setItems([]);
        setTotal(0);
        setLoadMore(true)
        setAllDataHere(false);
    }

    useEffect(() => {
        if (!loadMore) {
            return;
        }

        request('/api/search/list', {
            text: search,
            offset: total,
            limit: itemsLimit,
        }).then(({ok, data, error}) => {
            if (!mounted.current) {
                return;
            }

            setLoadMore(false);
            if (ok) {
                const newItems = data.list.map(({id, text, tags, time}) => ({
                    id,
                    html: mdToHtml(text),
                    tags,
                    time,
                }));
                setItems(items => items.concat(newItems));
                setTotal(total => total + newItems.length);

                if (newItems.length < itemsLimit) {
                    setAllDataHere(true);
                }
            } else {
                showError(error);
            }
        });
    }, [search, loadMore, total, request, showError, mounted]);

    function loadNext() {
        if (allDataHere) {
            return;
        }
        setLoadMore(true);
    }

    function renderItem(index) {
        const {id, html, tags, time} = items[index];

        return <Item
            id={id}
            html={html}
            tags={tags}
            time={time}
            key={id}
        />;
    }

    function renderFooter() {
        if (allDataHere) {
            return null;
        }

        return <div className={classes.listFooter}>
            <CircularProgress size={60}/>
        </div>
    }

    return (
        <>
            <Title title={title}/>
            <Container component="main" maxWidth="md" className={classes.main}>
                <Virtuoso
                    style={{ width: '100%', height: '100%' }}
                    overscan={500}
                    totalCount={total}
                    item={renderItem}
                    endReached={loadNext}
                    footer={renderFooter}
                />
            </Container>
        </>
    );
};
