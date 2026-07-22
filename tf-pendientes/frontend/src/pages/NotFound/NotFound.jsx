import { Link } from "react-router-dom";
import { Container, Card } from "react-bootstrap";
import './NotFound.css';

function NotFound() {
    return (
        <Container fluid className="notfound-container">
            <Card className="card-custom notfound-card shadow-lg border-0">
                <Card.Body>
                    <i className="bi bi-compass notfound-icon d-block"></i>
                    <h1 className="notfound-title">Error 404</h1>
                    <p className="notfound-text">
                        La página que estás buscando parece que no existe o ha sido movida.
                    </p>
                    <Link to="/dashboard" className="btn btn-primary rounded-pill px-4 py-2">
                        <i className="bi bi-house-door me-2"></i>
                        Volver al inicio
                    </Link>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default NotFound;