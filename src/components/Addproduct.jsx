import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

const AddProduct = ({ userId, onClose }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(null);
  const [imagenURL, setImagenURL] = useState('');
  const [categoria, setCategoria] = useState(null);
  const toast = React.useRef(null);

  const category = [
    { label: 'Mouse', value: 'Mouse' },
    { label: 'Teclado', value: 'Teclado' },
    { label: 'Case', value: 'Case' },
    { label: 'Procesador', value: 'Procesador' },
    { label: 'Tarjeta Gráfica', value: 'TarjetaGrafica' },
    { label: 'Memoria RAM', value: 'MemoriaRAM' },
    { label: 'Memoria ROM', value: 'MemoriaROM' },
    { label: 'Placa Madre', value: 'PlacaMadre' },
    { label: 'Accesorios', value: 'Accesorios' },
    { label: 'Fuente de Poder', value: 'FuentePoder' },
    { label: 'Ventilador', value: 'Ventilador' },
    { label: 'Monitores', value: 'Monitor' }
]

  const handleSubmit = async () => {
    if (!nombre || !descripcion || !precio || !imagenURL || !categoria) {
      toast.current.show({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor, complete todos los campos.',
        life: 3000,
      });
      return;
    }

    const nuevoProducto = {
      nombre,
      descripcion,
      precio,
      imagenURL,
      categoria,
    };

    try {
      const response = await fetch(
        `/api/producto/newproducto?userId=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevoProducto),
        }
      );

      if (!response.ok) {
        throw new Error('No se pudo añadir el producto. Verifique si el usuario es administrador.');
      }

      toast.current.show({
        severity: 'success',
        summary: 'Menú creado',
        detail: 'El producto se ha añadido exitosamente.',
        life: 3000,
      });

      setNombre('');
      setDescripcion('');
      setPrecio(null);
      setImagenURL('');
      setCategoria(null);
      onClose(); 
    } catch (error) {
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
          <label htmlFor="nombre">Nombre</label>
          <InputText
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
          <label htmlFor="precio">Precio</label>
          <InputNumber
            id="precio"
            value={precio}
            onValueChange={(e) => setPrecio(e.value)}
            mode="currency"
            currency="USD"
            locale="en-US"
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
        <div className="p-field p-col-12">
          <label htmlFor="imagenURL">URL de la Imagen</label>
          <InputText
            id="imagenURL"
            value={imagenURL}
            onChange={(e) => setImagenURL(e.target.value)}
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

export default AddProduct; 