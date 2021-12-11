import './cred-input.scss';

export default function CredInput({ name }) {
    if (name === "username") return (
        <div className="credInput">
            <img src="/icons/person.svg" />
            <input name="username" type="text" placeholder="Username" />
        </div>
    );

    return (
        <div className="credInput">
            <img src="/icons/key-fill.svg" />
            <input name="password" type="password" placeholder="Password" />
        </div>
    );
}