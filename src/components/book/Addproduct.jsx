import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { apiFetch } from '../../lib/api';  

const AddLibro = ({ onClose }) => { 
  const [titulo, setTitulo] = useState('');  
  const [autor, setAutor] = useState('');  
  const [descripcion, setDescripcion] = useState('');
  const [isbn, setIsbn] = useState('');  
  const [imagenUrl, setImagenUrl] = useState('');  
  const [categoria, setCategoria] = useState(null);
  const [copiasDisponibles, setCopiasDisponibles] = useState(null);  
  const toast = React.useRef(null);

  const category = [
    { label: 'Ficción', value: 'Ficción' },
    { label: 'No Ficción', value: 'NoFicción' },
    { label: 'Ciencia', value: 'Ciencia' },
    { label: 'Historia', value: 'Historia' },
    { label: 'Biografía', value: 'Biografía' },
  ];

  const handleSubmit = async () => {
    if (!titulo || !autor || !descripcion || !isbn || !imagenUrl || !categoria || copiasDisponibles === null) {
      toast.current.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor, complete todos los campos.',
        life: 3000,
      });
      return;
    }

    const nuevoLibro = {
      titulo,
      autor,
      descripcion,
      isbn,
      imagenUrl,
      categoria,
      copiasDisponibles,
    };

    try {
      await apiFetch(`/api/libros`, {  
        method: 'POST',
        body: JSON.stringify(nuevoLibro),
      });

      toast.current.show({
        severity: 'success',
        summary: 'Libro añadido',
        detail: 'El libro se ha añadido exitosamente.',
        life: 3000,
      });

      // Limpiar campos
      setTitulo('');
      setAutor('');
      setDescripcion('');
      setIsbn('');
      setImagenUrl('');
      setCategoria(null);
      setCopiasDisponibles(null);
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message,
        life: 3000,
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="p-fluid p-formgrid p-grid">
        <div className="p-field p-col-12">
          <label htmlFor="titulo">Título</label>
          <InputText
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div className="p-field p-col-12">
          <label htmlFor="autor">Autor</label>
          <InputText
            id="autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
          />
        </div>
        <div className="p-field p-col-12">
          <label htmlFor="descripcion">Descripción</label>
          <InputTextarea
            id="descripcion"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="p-field p-col-6">
          <label htmlFor="isbn">ISBN</label>
          <InputText
            id="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
        </div>
        <div className="p-field p-col-6">
          <label htmlFor="categoria">Categoría</label>
          <Dropdown
            id="categoria"
            value={categoria}
            options={category}
            onChange={(e) => setCategoria(e.value)}
          />
        </div>
        <div className="p-field p-col-6">
          <label htmlFor="imagenUrl">URL de la Imagen</label>
          <InputText
            id="imagenUrl"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
          />
        </div>
        <div className="p-field p-col-6">
          <label htmlFor="copiasDisponibles">Copias Disponibles</label>
          <InputNumber
            inputId="copiasDisponibles"
            value={copiasDisponibles}
            onValueChange={(e) => setCopiasDisponibles(e.value)}
            min={0}
          />
        </div>
      </div>
      <div className="p-mt-3">
        <Button
          label="Añadir"
          icon="pi pi-check"
          onClick={handleSubmit}
          className="p-mr-2"
        />
        <Button
          label="Cancelar"
          icon="pi pi-times"
          className="p-button-secondary"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default AddLibro;  