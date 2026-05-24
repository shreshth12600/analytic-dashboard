function Card({ title, children, action }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{title}</span>
        {action}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default Card;