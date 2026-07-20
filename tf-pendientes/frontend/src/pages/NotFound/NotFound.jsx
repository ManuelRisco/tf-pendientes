import Navbar from "../../components/Navbar/Navbar";
import './NotFound.css';

import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div>
            <Navbar />
            <h1>Error 404</h1>
            <p>La página solicitada no existe.</p>
            <Link to="/" className="btn btn-primary">
                Volver al inicio
            </Link>
        </div>
    );
}

export default NotFound;