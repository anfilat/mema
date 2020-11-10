import React from "react";
import _ from "lodash";
import {TextField, CircularProgress} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {Autocomplete} from "@material-ui/lab";
import {withSnackbar} from 'notistack';
import {bindShowError, Request} from "../utils";

const styles = {
    root: {
        width: '100%',
    },
}

class Tags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            search: '',
            options: [],
            loading: false,
        };
        this.showError = bindShowError(this);
        this.debouncedGetOptions = _.debounce(this.getOptions, 200);
        this.request = new Request(this, {cancelPrev: true});
    }

    componentWillUnmount() {
        this.request.stop();
    }

    onOpen = () => {
        this.setState({
            open: true,
        });
        this.debouncedGetOptions('');
    }

    onClose = () => {
        this.setState({
            open: false,
            options: [],
        });
        this.request.stop();
    }

    onInputChange = (event, value) => {
        this.setState({search: value});
        this.debouncedGetOptions(value);
    }

    onChange = (event, value) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    getOptions = (search) => {
        if (!this.state.open) {
            return;
        }

        this.request.fetch('/api/tag/list', {
            text: search,
            tags: this.props.value,
        }).then(this.onGetOptionsResult);
    }

    onGetOptionsResult = ({ok, data, error, aborted}) => {
        if (aborted) {
            return;
        }

        if (ok) {
            if (this.state.open) {
                this.setState({options: data.list});
            }
        } else {
            this.showError(error);
        }
    }

    filterOptions = (options, params) => {
        const filtered = [...options];

        const input = params.inputValue;
        if (input !== '' && !options.includes(input) && !this.props.value.includes(input)) {
            filtered.push(params.inputValue);
        }

        return filtered;
    }

    render() {
        const {open, search, options, loading} = this.state;
        const {value, classes} = this.props;

        return (
            <div className={classes.root}>
                <Autocomplete
                    selectOnFocus
                    freeSolo
                    multiple
                    open={open}
                    onOpen={this.onOpen}
                    onClose={this.onClose}
                    inputValue={search}
                    onInputChange={this.onInputChange}
                    value={value}
                    onChange={this.onChange}
                    filterOptions={this.filterOptions}
                    options={options}
                    loading={loading}
                    renderInput={(params) =>
                        <TextField
                            {...params}
                            label="Tags"
                            variant="standard"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    }
                />
            </div>
        );
    }
}

export default withStyles(styles)(withSnackbar(Tags));
