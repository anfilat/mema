import React from 'react';
import {Container, CircularProgress} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {Virtuoso} from 'react-virtuoso'
import {withSnackbar} from 'notistack';
import {AuthContext} from '../context/AuthContext';
import searchService from '../services/search';
import Title from '../components/Title';
import Item from '../components/Item';
import {bindShowError, mdToHtml, request} from '../utils';

const styles = theme => ({
    main: {
        height: `calc(100vh - 64px)`,
    },
    listFooter: {
        padding: `${theme.spacing(1)}px`,
        textAlign: 'center',
    },
});

const itemsLimit = 25;

class ItemsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            allDataHere: false,
        };
        this.unsubscribe = searchService.subscribe(this.onSearchChange);
        this.showError = bindShowError(this);
        this.requestCancel = null;
        setTimeout(() => this.loadMore(), 0);
    }

    static contextType = AuthContext;

    componentWillUnmount() {
        this.stopRequest();
        this.unsubscribe();
    }

    onSearchChange = () => {
        this.setState({
            items: [],
            allDataHere: false,
        }, this.loadMore);
    }

    loadNext = () => {
        if (this.state.allDataHere) {
            return;
        }

        this.loadMore();
    }

    loadMore() {
        const search = searchService.search;
        const total = this.state.items.length;

        request(this, '/api/search/list', {
                text: search,
                offset: total,
                limit: itemsLimit,
            },
            true,
            this.context.logout
        ).then(this.onLoadMoreResult);
    }

    onLoadMoreResult = ({ok, data, error, abort}) => {
        if (abort) {
            return;
        }

        if (ok) {
            const newItems = data.list.map(({id, text, tags, time}) => ({
                id,
                html: mdToHtml(text),
                tags: tags.sort(),
                time,
            }));
            this.setState(state => {
                return {
                    items: state.items.concat(newItems),
                };
            });

            if (newItems.length < itemsLimit) {
                this.setState({allDataHere: true});
            }
        } else {
            this.showError(error);
        }
    }

    stopRequest() {
        if (this.requestCancel) {
            this.requestCancel();
            this.requestCancel = null;
            this.setState({loading: false});
        }
    }

    render() {
        const {items, allDataHere} = this.state;
        const total = items.length;
        const search = searchService.search;
        const title = search ? `Items: ${search}` : 'Items';
        const {classes} = this.props;

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
                        style={{width: '100%', height: '100%'}}
                        overscan={500}
                        totalCount={total}
                        item={renderItem}
                        endReached={this.loadNext}
                        footer={renderFooter}
                    />
                </Container>
            </>
        );
    }
}

export default withStyles(styles)(withSnackbar(ItemsPage));
