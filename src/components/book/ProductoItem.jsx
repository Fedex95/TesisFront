import { ShoppingCartIcon } from '@heroicons/react/24/solid'

export default function MenuItem({ item, onAddToCart }) {
  return (
    <div className="menu-item">
      <img src={item.imagenUrl} alt={item.titulo} /> 
      <h3>{item.titulo}</h3>  
      <p>{item.descripcion}</p>
      <p className="author">Autor: {item.autor}</p>  
      <button 
        className="buy-button"
        onClick={() => onAddToCart(item)}
      >
        <ShoppingCartIcon className="h-5 w-5" />
        Agregar libro al carrito 
      </button>
    </div>
  )
}