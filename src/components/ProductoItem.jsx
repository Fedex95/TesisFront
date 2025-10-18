import { ShoppingCartIcon } from '@heroicons/react/24/solid'

export default function MenuItem({ item, onAddToCart }) {
  return (
    <div className="menu-item">
      <img src={item.image} alt={item.name} />
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <p className="price">${item.price}</p>
      <button 
        className="buy-button"
        onClick={() => onAddToCart(item)}
      >
        <ShoppingCartIcon className="h-5 w-5" />
        Agregar al carrito
      </button>
    </div>
  )
}