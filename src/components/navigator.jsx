import MenuList from '../utils/menu-list';
import './navigator.scss';

export default function Nav({ tab, setTab, setEditing, signOut, setSearchMethod }) {
    let menu = MenuList();

    return (
        <nav>
            <h1>Extra Duties</h1>

            {menu.map((v, i) => <div className={tab === i ? "selected" : ""} onClick={() => {
                setTab(i);
                if (setEditing) setEditing(-1);
                setSearchMethod("all");
            }}>
                <img src="/icons/list.svg" />
                {v}
            </div>)}

            <div onClick={signOut}>
                <img src="/icons/list.svg" />
                <p>Sign Out</p>
            </div>
        </nav>
    );
}