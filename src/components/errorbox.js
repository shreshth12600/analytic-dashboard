import { api_base } from "../config/config";

function ErrorBox({ msg }) {
  return (
    <div className="err-box">
      <strong>⚠ Failed to load data</strong><br />
      {msg}<br />
      <span className="err-box-sub">Make sure the FastAPI backend is running on {api_base}</span>
    </div>
  );
}

export default ErrorBox;