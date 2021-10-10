import { Redirect, Route } from "react-router";
import { useContext } from "react";
import SiteContext from "./site-context";

export default function UtilRoute({ component: Component, redirect, authed, unauthed, ...rest }) {
    let { user } = useContext(SiteContext);

    // Doesn't matter
    if (!authed && !unauthed)
        return <Route render={props => <Component {...props} />} {...rest} />

    // Logged in
    if (authed && user)
        return <Route render={props => <Component {...props} />} {...rest} />

    // Logged out
    if (unauthed && !user)
        return <Route render={props => <Component {...props} />} {...rest} />

    // Redirect
    return <Route render={props => <Redirect to={{ pathname: redirect, state: { from: props.location } }} />} {...rest} />
}
