import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export default function BookDialog({
    visible,
    onHide,
    selectedLibro,
    quantities,
    handleQuantityChange,
    addToCart,
    categorias
}) {
    return (
        <Dialog
            header="Detalles del Libro"
            visible={visible}
            style={{
                width: '30vw',
                padding: '15px',
                borderRadius: '10px',
                backgroundColor: '#f5f5f5',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}
            onHide={onHide}
            modal
            draggable={false}
            className="p-d-flex p-ai-center"
            baseZIndex={1000}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '10px',
                    padding: '20px',
                    marginTop: '10px',
                    textAlign: 'center',
                }}
            >
                <img
                    src={selectedLibro?.imagenUrl}
                    alt={selectedLibro?.titulo}
                    className="menu-image"
                    style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginBottom: '15px',
                    }}
                />
                <h3
                    style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '8px',
                    }}
                >
                    {selectedLibro?.titulo}
                </h3>
                <p
                    style={{
                        fontSize: '14px',
                        color: '#555',
                        marginBottom: '12px',
                    }}
                >
                    {selectedLibro?.descripcion}
                </p>
                <p
                    style={{
                        fontSize: '14px',
                        color: '#888',
                        marginBottom: '10px',
                    }}
                >
                    Autor: {selectedLibro?.autor}
                </p>
                <p
                    style={{
                        fontSize: '14px',
                        color: '#888',
                        marginBottom: '10px',
                    }}
                >
                    ISBN: {selectedLibro?.isbn}
                </p>
                <p
                    style={{
                        fontSize: '14px',
                        color: '#888',
                        fontStyle: 'italic',
                        marginBottom: '20px',
                    }}
                >
                    {categorias.find(c => c.value === selectedLibro?.categoria)?.label || selectedLibro?.categoria}
                </p>

                {selectedLibro && (
                    <div>
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                            }}
                        >
                            <strong>Cantidad:</strong>
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '15px',
                            }}
                        >
                            <Button
                                icon="pi pi-minus"
                                className="p-button-rounded p-button-outlined"
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    padding: '0',
                                    fontSize: '16px',
                                }}
                                onClick={() => handleQuantityChange(selectedLibro.id, (quantities[selectedLibro.id] || 1) - 1)}
                                disabled={(quantities[selectedLibro.id] || 1) <= 1}
                            />
                            <span
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {quantities[selectedLibro.id] || 1}
                            </span>
                            <Button
                                icon="pi pi-plus"
                                className="p-button-rounded p-button-outlined"
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    padding: '0',
                                    fontSize: '16px',
                                }}
                                onClick={() => handleQuantityChange(selectedLibro.id, (quantities[selectedLibro.id] || 1) + 1)}
                            />
                        </div>
                        <Button
                            label="Agregar al carrito"
                            icon="pi pi-cart-plus"
                            className="p-button-success p-mt-3 p-button-rounded"
                            style={{
                                width: '70%',
                                padding: '10px 0',
                                fontSize: '14px',
                                fontWeight: 'bold',
                            }}
                            onClick={() => addToCart(selectedLibro.id)}
                        />
                    </div>
                )}
            </div>
        </Dialog>
    );
}