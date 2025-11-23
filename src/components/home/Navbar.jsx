import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Menu } from 'primereact/menu';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


function Navbar({ cartItemsCount, userMenuItems, userMenu, userData }) {
    return (

        <nav
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'darkblue',
                color: 'white'
            }}
        >

            {/* Contenedor de la marca */}
            <Link to="/home" style={{ fontSize: '1.5rem', color: 'white' }}>
                Library Master
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {/*userData*/}

                <div>
                    <p>{userData?.nombre || ''}</p>
                </div>
                <div style={{ marginRight: '10px' }}>
                    <p>{userData?.apellido || ''}</p>
                </div>


                <Link to="/cart">
                    <Button
                        icon="pi pi-shopping-cart"
                        outlined
                        style={{
                            backgroundColor: 'transparent',
                            color: '#fff',
                            borderColor: '#ffffff',
                        }}
                    />
                    {cartItemsCount > 0 && (
                        <Badge value={cartItemsCount} className="p-ml-2" />
                    )}
                </Link>
                <Link to="/pedidos">
                    <Button
                        icon="pi pi-clipboard"
                        outlined
                        style={{
                            backgroundColor: 'transparent',
                            color: '#fff',
                            borderColor: '#ffffff',
                        }}
                    />
                </Link>
                {/* Botón de usuario */}
                <Button
                    icon="pi pi-user"
                    outlined
                    onClick={(e) => userMenu.current.toggle(e)}
                    aria-controls="user-menu"
                    aria-haspopup
                    style={{
                        backgroundColor: 'transparent',
                        color: '#fff',
                        borderColor: '#ffffff',
                    }}
                />
                <Menu
                    id="user-menu"
                    ref={userMenu}
                    model={userMenuItems}
                    popup
                    className="user-menu"
                    dismissable
                    autoZIndex
                />
            </div>
        </nav>
    );
}

export default Navbar;