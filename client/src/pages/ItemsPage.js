import React from 'react';
import {Container} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {mdToHtml} from '../utils';
import {Title} from '../components/Title';
import {Item} from '../components/Item';

const text = `
Некий текст. Текст для *проверки* __работы__

# Заголовок

- Список
- Пункт списка
`;

const html = mdToHtml(text);

const useStyles = makeStyles(theme => ({
    main: {
        'margin-top': `${theme.spacing(1)}px`,
        'margin-bottom': `${theme.spacing(1)}px`,
        '& > *': {
            'margin-bottom': `${theme.spacing(1)}px`,
        }
    },
}));

export const ItemsPage = () => {
    const classes = useStyles();

    return (
        <>
            <Title title="Items"/>
            <Container component="main" maxWidth="md" className={classes.main}>
                <Item text={html} tags={['Тэгг', 'и вот она нарядная']} />
                <Item text={html} tags={[]} />
                <Item text={html} tags={['Как-то так']}/>
            </Container>
        </>
    );
};
