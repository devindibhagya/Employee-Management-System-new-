export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function hueFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export default function Avatar({ name, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ '--hue': hueFor(name) }}>
      {initials(name)}
    </span>
  );
}
