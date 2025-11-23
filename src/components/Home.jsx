import { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function Home() {
  const [libros] = useState([
    { id: 1, titulo: 'Libro 1', descripcion: 'Descripción 1', autor: 'Autor 1', imagenUrl: 'https://via.placeholder.com/300' },
    { id: 2, titulo: 'Libro 2', descripcion: 'Descripción 2', autor: 'Autor 2', imagenUrl: 'https://via.placeholder.com/300' },
  ]);

  return (
    <div className="p-4">
      <h1>Bienvenido a Library Master</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {libros.map(libro => (
          <Card key={libro.id} style={{ width: '300px' }}>
            <img src={libro.imagenUrl} alt={libro.titulo} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <h3>{libro.titulo}</h3>
            <p>{libro.descripcion}</p>
            <p>Autor: {libro.autor}</p>
            <Button label="Ver detalles" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Home;