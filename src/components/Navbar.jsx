import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function Navbar({ cartItemsCount }) {

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
      <Link to="/" style={{ fontSize: '1.5rem', color: 'white' }}>
        Library Master
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
          {cartItemsCount > 0 && <span>{cartItemsCount}</span>}
        </Link>
        <Button
          icon="pi pi-user"
          outlined
          style={{
            backgroundColor: 'transparent',
            color: '#fff',
            borderColor: '#ffffff',
          }}
        />
      </div>
    </nav>
  );
}

export default Navbar;