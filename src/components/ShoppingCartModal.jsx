export function ShoppingCartModal({ groups, onUpdateQuantity, onGotIt, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cart-modal" onClick={(e) => e.stopPropagation()}>
        <h3>🛒 Shopping Cart</h3>
        {groups.length === 0 ? (
          <p>Nothing to buy right now — check "Buy" on an item to add it here.</p>
        ) : (
          groups.map((group) => (
            <div key={group.tripId} className="cart-group">
              <h4>{group.tripName}</h4>
              <ul className="cart-items">
                {group.items.map((item) => {
                  const canEditQuantity = item.tripKind === 'private' || item.isOwner
                  return (
                    <li key={item.id} className="cart-item">
                      <span className="cart-item-name">{item.name}</span>
                      {canEditQuantity ? (
                        <div className="quantity-stepper">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item, Math.max(1, item.quantity - 1))}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => onUpdateQuantity(item, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="quantity-static">×{item.quantity}</span>
                      )}
                      <button className="btn btn-secondary" onClick={() => onGotIt(item)}>
                        Got it
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
