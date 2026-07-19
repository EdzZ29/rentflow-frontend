import logo from '../assets/images/rentflow-logo.png';

// RentFlow logo mark. Import lets Vite hash + bundle the asset correctly.
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <img
      src={logo}
      alt="RentFlow logo"
      className={`${className} object-contain`}
    />
  );
}
