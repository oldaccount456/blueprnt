import {
    Container,
    Navbar,
    Nav,
    Button,
    NavDropdown
} from 'react-bootstrap'
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function NavbarComponent(props){
    return (
        <Navbar id={styles['navbar']} bg="light" expand="lg">
            <Container fluid>
                <Navbar.Brand id={styles['navbar-brand']} href="/">
                    <Image src='/logo.png' alt='Logo' width={694/4} height={134/4} quality={100} />
                    <div id={styles['logo-footer']}>Upload images today!</div>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll"/>
                    <div className="d-flex " id={styles['nav-options']}>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ml-auto" style={{ maxHeight: '100px' }} navbarScroll>
                                {props.user ? (
                                    <>
                                        <Nav.Link className={styles['nav-link']} href="/">
                                            <Button className={`${styles['nav-link']} ${styles['upload-btn']}`}  variant="danger" type="submit">
                                            Upload
                                            </Button>
                                        </Nav.Link>
             
                                        <div id={styles['profile']}>
                                            <div id={styles['avatar-circle']}>{props.user[0].toUpperCase()}</div>
                                            <NavDropdown align="end" id={styles['nav-dropdown']} title={props.user} menuVariant="transparent">
                                                <NavDropdown.Item  className={styles['nav-dropdown-link']} href="/gallery">
                                                    Gallery
                                                </NavDropdown.Item>
                                                <NavDropdown.Item  className={styles['nav-dropdown-link']} href="/panel">
                                                    Account Settings
                                                </NavDropdown.Item>
                                                <NavDropdown.Item  className={styles['nav-dropdown-link']} href="/logout">
                                                    Log out
                                                </NavDropdown.Item>
                                            </NavDropdown>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Nav.Link className={styles['nav-link']} href="/">
                                            <Button  className={`${styles['nav-link']} ${styles['upload-btn']}`} variant="danger" type="submit">
                                            Upload
                                            </Button>
                      
                                        </Nav.Link>
                                        <Nav.Link className={`${styles['nav-link']} ${styles['nav-text']}`} href="/login">
                                            Login
                                        </Nav.Link>
                                        <Nav.Link className={`${styles['nav-link']} ${styles['nav-text']}`} href="/register">
                                            Register
                                        </Nav.Link> 
                                    </>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </div>
            </Container>
        </Navbar>
    )
}