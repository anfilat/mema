export function bindField(component, name) {
    return function changeHandler(event) {
        component.setState({
            [name]: event.target.value
        });
    }
}
