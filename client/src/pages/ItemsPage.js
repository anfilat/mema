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
import DeleteDialog from '../components/DeleteDialog';
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
    const {showSuccess, showError} = useSnackbarEx();
    const [currentSearch, setCurrentSearch] = useState(searchService.search);
    const [items, setItems] = useState([]);
    const [offset, setOffset] = useState(0);
    const [allDataHere, setAllDataHere] = useState(false);
    const [loading, setLoading] = useState(0);
    const isLoading = loading > 0;
    const total = items.length;
    const title = currentSearch ? `Items: ${currentSearch}` : 'Items';
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [delItemId, setDelItemId] = useState(null);
    const [delLoading, setDelLoading] = useState(null);

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
            reload();
        });

        return () => {
            unsubscribe();
        };
    });

    function reload() {
        setItems([]);
        setOffset(0);
        setAllDataHere(false);
        loadMore();
    }

    function loadNext() {
        if (isLoading || allDataHere) {
            return;
        }

        loadMore();
    }

    function delItem(id) {
        setDelItemId(id);
        setOpenDeleteDialog(true);
    }

    function handleCloseDeleteDialog() {
        setOpenDeleteDialog(false);
    }

    const reallyDelete = useOnCallEffect(() => {
        setOpenDeleteDialog(false);
        setDelLoading(delItemId);

        const request = new Request({abortOnUnmount: false});
        request.fetch('/api/item/del', {
            itemId: delItemId,
        }).then(({ok, data, error, exit}) => {
            if (ok) {
                showSuccess(data.message);
            } else {
                showError(error);
            }

            if (exit) {
                return;
            }

            setDelLoading(null);

            if (ok) {
                setItems(items => items.filter(value => value.id !== delItemId));
            }
        });

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    function extractItem(id) {
        setItems(items => items.filter(value => value.id !== id));
        extractOnServer(id);
    }

    function upItem(id) {
        setItems(items => {
            const index = items.findIndex((value => value.id === id));
            if (index !== -1 && index !== 0) {
                const t = items[index - 1];
                items[index - 1] = items[index];
                items[index] = t;

                upOnServer(id, t.id);
            }
            return [...items];
        });
    }

    function downItem(id) {
        setItems(items => {
            const index = items.findIndex((value => value.id === id));
            if (index !== -1 && index !== total - 1) {
                const t = items[index + 1];
                items[index + 1] = items[index];
                items[index] = t;

                downOnServer(id, t.id);
            }
            return [...items];
        });
    }

    function extractOnServer(id) {
        const request = new Request({abortOnUnmount: false});
        request.fetch('/api/search/extract', {
            text: currentSearch,
            id,
        }).then(onServerResult);
    }

    function upOnServer(id, beforeId) {
        const request = new Request({abortOnUnmount: false});
        request.fetch('/api/search/up', {
            text: currentSearch,
            id,
            beforeId,
        }).then(onServerResult);
    }

    function downOnServer(id, afterId) {
        const request = new Request({abortOnUnmount: false});
        request.fetch('/api/search/down', {
            text: currentSearch,
            id,
            afterId,
        }).then(onServerResult);
    }

    function onServerResult({data, error, exit}) {
        if (error) {
            showError(error);
        }

        if (exit) {
            return;
        }

        if (data.outdated) {
            reload();
        }
    }

    function renderItem(index) {
        const {id, html, tags, time} = items[index];
        const extractDisabled = currentSearch === '';
        const upDisabled = currentSearch === '' || index === 0;
        const downDisabled = currentSearch === '' || index === total - 1;
        const disableAll = delLoading === id;

        return <Item
            key={id}
            id={id}
            html={html}
            tags={tags}
            time={time}
            delItem={delItem}
            extractItem={extractItem}
            extractDisabled={extractDisabled}
            upItem={upItem}
            upDisabled={upDisabled}
            downItem={downItem}
            downDisabled={downDisabled}
            disableAll={disableAll}
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
            <DeleteDialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                onOk={reallyDelete}
            />
        </>
    );
}
