import logo from '../assets/images/rentivo.png';

// Rentivo logo mark. Import lets Vite hash + bundle the asset correctly.
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <img
      src={logo}
      alt="Rentivo logo"
      className={`${className} object-contain`}
    />
  );
}
