import './Loader.css';

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="loader">
      <div className="loader-mark" />
      <span>{label}&hellip;</span>
    </div>
  );
}
