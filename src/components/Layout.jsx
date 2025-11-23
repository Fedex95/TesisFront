import Navbar from './Navbar'; 
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function Layout({ children }) {
    const cartItemsCount = 0;

    return (
        <div className="layout-container" style={{ backgroundColor: "#f8f8f8" }}>
            <Navbar cartItemsCount={cartItemsCount} />
            <div className="p-mb-4">
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}