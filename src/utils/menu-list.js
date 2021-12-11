import { useContext } from "react";
import SiteContext from "./site-context";

export default function MenuList() {
    let { userRole } = useContext(SiteContext);

    return userRole > 0 ? ["Events", "Users", "Profile", "Settings"] : ["Events", "Profile"];
}