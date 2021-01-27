import React, {useState} from 'react';
import {Container, CircularProgress} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Virtuoso} from 'react-virtuoso'
import useFullEffect from "fulleffect-hook";
import useOnCallEffect from 'oncalleffect-hook';
import {mdToHtml} from 'common';
import searchService from '../services/search';
import Title from '../components/Title';
import Item from '../components/Item';
import {Request} from '../utils';
import useSnackbarEx from "../hooks/snackbarEx.hook";

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

export default function ItemsPage() {
    const classes = useStyles();
    const {showError} = useSnackbarEx();
    const [currentSearch, setCurrentSearch] = useState(searchService.search);
    const [items, setItems] = useState([]);
    const [offset, setOffset] = useState(0);
    const [allDataHere, setAllDataHere] = useState(false);
    const [loading, setLoading] = useState(0);
    const isLoading = loading > 0;
    const total = items.length;
    const title = currentSearch ? `Items: ${currentSearch}` : 'Items';

    const loadMore = useOnCallEffect(() => {
        let canceled = false;

        setLoading(val => val + 1);
        const request = new Request();
        request.fetch('/api/search/list', {
            text: currentSearch,
            offset,
            limit: itemsLimit,
        }).then(({ok, data, error, exit}) => {
            if (error) {
                showError(error);
            }

            if (exit) {
                return;
            }

            setLoading(val => val - 1);

            if (ok && !canceled) {
                const newItems = data.list.map(({id, text, tags, time}) => ({
                    id,
                    html: mdToHtml(text),
                    tags: tags.sort(),
                    time,
                }));
                setItems(items => items.concat(newItems));
                setOffset(data.offset);

                if (data.all) {
                    setAllDataHere(true);
                }
            }
        });

        return (mounted) => {
            canceled = true;
            if (mounted) {
                request.stop();
            } else {
                request.willUnmount();
            }
        }
    });

    useFullEffect(() => {
        loadMore();
    }, []);

    useFullEffect(() => {
        const unsubscribe = searchService.subscribe(value => {
            if (value === currentSearch) {
                return;
            }

            setCurrentSearch(value);
            setItems([]);
            setOffset(0);
            setAllDataHere(false);
            loadMore();
        });

        return () => {
            unsubscribe();
        };
    });

    function loadNext() {
        if (isLoading || allDataHere) {
            return;
        }

        loadMore();
    }

    function removeItem(id) {
        setItems(items => items.filter(value => value.id !== id));
    }

    function renderItem(index) {
        const {id, html, tags, time} = items[index];

        return <Item
            id={id}
            html={html}
            tags={tags}
            time={time}
            key={id}
            remove={removeItem}
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
                    style={{width: '100%', height: '100%'}}
                    overscan={500}
                    totalCount={total}
                    item={renderItem}
                    endReached={loadNext}
                    footer={renderFooter}
                />
            </Container>
        </>
    );
}
